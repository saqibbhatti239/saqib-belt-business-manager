import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Server,
  Key,
  Smartphone,
  Shield,
  Laptop,
  Radio,
  ExternalLink,
  LogOut,
  Info,
} from 'lucide-react';
import { AppSettings } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
} from '../services/firebaseAuth';
import {
  listDriveBackups,
  uploadDriveBackup,
  downloadDriveBackup,
  deleteDriveBackup,
  DriveBackupFile,
} from '../services/googleDriveSync';
import {
  PrivateServerSyncService,
  PrivateSyncConfig,
  PrivateSyncSnapshot,
} from '../services/privateServerSync';
import { User } from 'firebase/auth';

interface Props {
  settings: AppSettings;
  onRefreshAll: () => void;
}

export const CloudSyncView: React.FC<Props> = ({ settings, onRefreshAll }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [activeSyncTarget, setActiveSyncTarget] = useState<'google_drive' | 'private_server'>('google_drive');

  // Google Drive Auth States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveActionMsg, setDriveActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Private Server States
  const [privateConfig, setPrivateConfig] = useState<PrivateSyncConfig>(() =>
    PrivateServerSyncService.getConfig()
  );
  const [remoteSnapshot, setRemoteSnapshot] = useState<PrivateSyncSnapshot | null>(null);
  const [isPushingPrivate, setIsPushingPrivate] = useState(false);
  const [isPullingPrivate, setIsPullingPrivate] = useState(false);
  const [privateActionMsg, setPrivateActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation Modals for Destructive Operations (MANDATORY per Google Workspace security policy)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'Confirm',
    isDestructive: false,
    onConfirm: () => {},
  });

  // Initialize Auth state listener on component mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, accessToken) => {
        setGoogleUser(user);
        setToken(accessToken);
        loadDriveFiles(accessToken);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
        setDriveBackups([]);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadDriveFiles = async (accessToken: string) => {
    setIsLoadingDrive(true);
    try {
      const files = await listDriveBackups(accessToken);
      setDriveBackups(files);
    } catch (err: any) {
      setDriveActionMsg({ type: 'error', text: err.message || 'Failed to list Google Drive files' });
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setDriveActionMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setToken(result.accessToken);
        await loadDriveFiles(result.accessToken);
        setDriveActionMsg({
          type: 'success',
          text: `Connected to Google Drive as ${result.user.displayName || result.user.email}!`,
        });
      }
    } catch (err: any) {
      setDriveActionMsg({ type: 'error', text: err.message || 'Google Sign-in failed' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setToken(null);
    setDriveBackups([]);
    setDriveActionMsg({ type: 'success', text: 'Disconnected from Google Drive' });
  };

  // --- GOOGLE DRIVE BACKUP & RESTORE ACTIONS ---
  const handleBackupToDrive = async () => {
    if (!token) return;
    setIsLoadingDrive(true);
    setDriveActionMsg(null);
    try {
      const jsonBackup = db.exportBackup();
      await uploadDriveBackup(token, jsonBackup);
      await loadDriveFiles(token);
      setDriveActionMsg({
        type: 'success',
        text: 'Database successfully backed up to your Google Drive!',
      });
    } catch (err: any) {
      setDriveActionMsg({ type: 'error', text: err.message || 'Failed to upload backup to Drive' });
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const promptRestoreFromDrive = (file: DriveBackupFile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Database from Google Drive?',
      description: `Restoring '${file.name}' will update your local belt catalog, sales records, purchases, and ledgers with the contents of this cloud backup snapshot. Any local unsaved changes will be replaced.`,
      actionLabel: 'Restore Database',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (!token) return;
        setIsLoadingDrive(true);
        try {
          const content = await downloadDriveBackup(token, file.id);
          const res = db.restoreBackup(content);
          if (res.success) {
            setDriveActionMsg({ type: 'success', text: 'Database successfully restored from Google Drive!' });
            onRefreshAll();
          } else {
            setDriveActionMsg({ type: 'error', text: res.message });
          }
        } catch (err: any) {
          setDriveActionMsg({ type: 'error', text: err.message || 'Failed to restore backup' });
        } finally {
          setIsLoadingDrive(false);
        }
      },
    });
  };

  const promptDeleteDriveFile = (file: DriveBackupFile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Cloud Backup from Google Drive?',
      description: `Are you sure you want to delete '${file.name}' from your Google Drive? This action cannot be undone.`,
      actionLabel: 'Delete File',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (!token) return;
        setIsLoadingDrive(true);
        try {
          await deleteDriveBackup(token, file.id);
          await loadDriveFiles(token);
          setDriveActionMsg({ type: 'success', text: 'Backup file removed from Google Drive' });
        } catch (err: any) {
          setDriveActionMsg({ type: 'error', text: err.message || 'Failed to delete file' });
        } finally {
          setIsLoadingDrive(false);
        }
      },
    });
  };

  // --- PRIVATE SERVER & CROSS-DEVICE ACTIONS ---
  const handleSavePrivateConfig = (updates: Partial<PrivateSyncConfig>) => {
    const updated = { ...privateConfig, ...updates };
    setPrivateConfig(updated);
    PrivateServerSyncService.saveConfig(updated);
  };

  const handlePushPrivate = async () => {
    setIsPushingPrivate(true);
    setPrivateActionMsg(null);
    try {
      const jsonBackup = db.exportBackup();
      const snapshot = await PrivateServerSyncService.pushSnapshot(jsonBackup, privateConfig);
      setRemoteSnapshot(snapshot);
      setPrivateActionMsg({
        type: 'success',
        text: `Local database pushed to Cloud Vault with Sync Code [${privateConfig.syncCode}]!`,
      });
    } catch (err: any) {
      setPrivateActionMsg({ type: 'error', text: err.message || 'Failed to push to server' });
    } finally {
      setIsPushingPrivate(false);
    }
  };

  const handlePullPrivate = async () => {
    setIsPullingPrivate(true);
    setPrivateActionMsg(null);
    try {
      const snapshot = await PrivateServerSyncService.pullSnapshot(privateConfig);
      if (snapshot) {
        setRemoteSnapshot(snapshot);
        setPrivateActionMsg({
          type: 'success',
          text: `Found remote snapshot from ${snapshot.deviceName} (${new Date(snapshot.timestamp).toLocaleString()})`,
        });
      } else {
        setPrivateActionMsg({
          type: 'error',
          text: `No remote snapshot found for pairing code [${privateConfig.syncCode}]. Push from your other device first.`,
        });
      }
    } catch (err: any) {
      setPrivateActionMsg({ type: 'error', text: err.message || 'Failed to pull from server' });
    } finally {
      setIsPullingPrivate(false);
    }
  };

  const promptApplyPrivateSnapshot = () => {
    if (!remoteSnapshot) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Sync & Restore Remote Snapshot?',
      description: `This will update your local database with the snapshot from '${remoteSnapshot.deviceName}' containing ${remoteSnapshot.recordCount.products} products and ${remoteSnapshot.recordCount.sales} sales recorded at ${new Date(remoteSnapshot.timestamp).toLocaleString()}.`,
      actionLabel: 'Apply & Synchronize',
      isDestructive: true,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const res = db.restoreBackup(remoteSnapshot.databasePayload);
        if (res.success) {
          setPrivateActionMsg({
            type: 'success',
            text: 'Database successfully synchronized with remote device!',
          });
          onRefreshAll();
        } else {
          setPrivateActionMsg({ type: 'error', text: res.message });
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
              Cloud Sync &amp; Cross-Device Backup
            </h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              Secure AES / OAuth
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synchronize belt business inventory, sales, and ledgers between Saqib, Adil, and Javaid across phones, tablets, and computers
          </p>
        </div>

        {/* Sync Mode Switcher */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveSyncTarget('google_drive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
              activeSyncTarget === 'google_drive'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Google Drive</span>
          </button>
          <button
            onClick={() => setActiveSyncTarget('private_server')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
              activeSyncTarget === 'private_server'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Private Server / Code</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: GOOGLE DRIVE BACKUP & RESTORE                         */}
      {/* ============================================================ */}
      {activeSyncTarget === 'google_drive' && (
        <div className="space-y-6">
          {driveActionMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow ${
                driveActionMsg.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/40 text-red-200'
              }`}
            >
              <span>{driveActionMsg.text}</span>
              <button onClick={() => setDriveActionMsg(null)} className="font-bold ml-2">✕</button>
            </div>
          )}

          {/* Connection Status Card */}
          <div className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                    <span>Google Drive Cloud Storage</span>
                    {googleUser && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {googleUser
                      ? `Signed in as ${googleUser.displayName || 'Google Account'} (${googleUser.email})`
                      : 'Authenticate with Google to enable automatic cloud backup and recovery'}
                  </p>
                </div>
              </div>

              {/* Login / Logout Button */}
              <div>
                {!googleUser ? (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackupToDrive}
                      disabled={isLoadingDrive}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 text-neutral-950" />
                      <span>{isLoadingDrive ? 'Saving...' : 'Backup Now to Drive'}</span>
                    </button>
                    <button
                      onClick={handleGoogleSignOut}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
                      title="Disconnect Account"
                    >
                      <LogOut className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Existing Google Drive Backups List */}
          <div className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h4 className="font-brand font-bold text-base text-neutral-100">
                  Google Drive Backup Snapshots ({driveBackups.length})
                </h4>
                <p className="text-xs text-neutral-400">
                  Database archives stored in your personal Google Drive (Scope: <code>drive.file</code>)
                </p>
              </div>

              {googleUser && (
                <button
                  onClick={() => token && loadDriveFiles(token)}
                  disabled={isLoadingDrive}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {!googleUser ? (
              <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl space-y-2 text-neutral-400 text-xs">
                <Cloud className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                <p className="font-semibold text-neutral-300">Google Drive is not connected yet</p>
                <p>Click "Sign in with Google" above to view, store, and restore belt business database backups.</p>
              </div>
            ) : driveBackups.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl space-y-2 text-neutral-400 text-xs">
                <Cloud className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                <p className="font-semibold text-neutral-300">No backup snapshots found in Google Drive</p>
                <p>Click "Backup Now to Drive" above to create your first encrypted cloud snapshot.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                      <th className="pb-3">Backup File</th>
                      <th className="pb-3">Created / Modified</th>
                      <th className="pb-3">Snapshot Details</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-sans">
                    {driveBackups.map((file) => (
                      <tr key={file.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3 font-mono font-bold text-amber-400">
                          {file.name}
                        </td>
                        <td className="py-3 text-neutral-300 font-mono text-[11px]">
                          {new Date(file.modifiedTime).toLocaleString()}
                        </td>
                        <td className="py-3 text-neutral-400 text-[11px]">
                          {file.description || 'Database JSON Payload'}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => promptRestoreFromDrive(file)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
                              title="Restore Database from this file"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => promptDeleteDriveFile(file)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PRIVATE SERVER & PAIRING CODE SYNC                    */}
      {/* ============================================================ */}
      {activeSyncTarget === 'private_server' && (
        <div className="space-y-6">
          {privateActionMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow ${
                privateActionMsg.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/40 text-red-200'
              }`}
            >
              <span>{privateActionMsg.text}</span>
              <button onClick={() => setPrivateActionMsg(null)} className="font-bold ml-2">✕</button>
            </div>
          )}

          {/* Pairing Code Card */}
          <div className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                    <span>Cross-Device Pairing Code</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Saqib, Adil, and Javaid enter this exact code on their Android phones to sync the same shop database
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={privateConfig.syncCode}
                  onChange={(e) => handleSavePrivateConfig({ syncCode: e.target.value.trim().toUpperCase() })}
                  className="px-3.5 py-2 bg-neutral-950 border border-amber-500/50 rounded-xl font-mono text-base font-extrabold text-amber-400 text-center tracking-wider focus:outline-none"
                  placeholder="SAQIB-8942"
                />
              </div>
            </div>

            {/* Device & Server Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">
                  Device Friendly Name
                </label>
                <input
                  type="text"
                  value={privateConfig.deviceName}
                  onChange={(e) => handleSavePrivateConfig({ deviceName: e.target.value })}
                  placeholder="e.g. Saqib Mobile / Counter Tablet"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">
                  Private Sync Server / IP Endpoint
                </label>
                <input
                  type="text"
                  value={privateConfig.serverUrl}
                  onChange={(e) => handleSavePrivateConfig({ serverUrl: e.target.value })}
                  placeholder="https://sync.saqibbelts.com or http://192.168.1.100:8000"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Push and Pull Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handlePushPrivate}
                disabled={isPushingPrivate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-neutral-950" />
                <span>{isPushingPrivate ? 'Pushing...' : 'Push Local Data to Cloud Vault'}</span>
              </button>

              <button
                onClick={handlePullPrivate}
                disabled={isPullingPrivate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{isPullingPrivate ? 'Checking...' : 'Pull from Code / Check Remote'}</span>
              </button>
            </div>
          </div>

          {/* Remote Snapshot Inspection Card */}
          {remoteSnapshot && (
            <div className={`p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 shadow-md space-y-3 text-xs`}>
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Remote Cloud Vault Snapshot Ready</span>
                </div>
                <span className="font-mono text-emerald-400">{remoteSnapshot.syncCode}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase">Source Device</span>
                  <span className="font-bold text-neutral-100">{remoteSnapshot.deviceName}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase">Timestamp</span>
                  <span className="font-bold text-neutral-100">{new Date(remoteSnapshot.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase">Products</span>
                  <span className="font-bold text-amber-400">{remoteSnapshot.recordCount.products} items</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase">Sales Bills</span>
                  <span className="font-bold text-emerald-400">{remoteSnapshot.recordCount.sales} invoices</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={promptApplyPrivateSnapshot}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-transform active:scale-95"
                >
                  Apply &amp; Restore Snapshot to this Device
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explicit User Confirmation Dialog (MANDATORY for mutating/destructive cloud operations) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl mt-0.5 ${confirmDialog.isDestructive ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100">{confirmDialog.title}</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 font-semibold hover:bg-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-lg font-bold text-white shadow cursor-pointer transition-transform active:scale-95 ${
                  confirmDialog.isDestructive ? 'bg-red-700 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
