import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Lock,
  Globe,
  Palette,
  Bell,
  BellRing,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  Camera,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Percent,
  Receipt,
  Check,
  ArrowLeft,
  Copy,
  Clock,
  Moon,
  Sun,
  Smartphone,
  Send,
  Cloud,
  FileText,
  BadgeCheck,
  ChevronRight,
  Database,
  Volume2,
} from 'lucide-react';
import { AppSettings, Language, ThemeId, WallpaperConfig, TaxConfig, UserProfile, NotificationSettings } from '../types';
import { translations } from '../i18n/translations';
import { themes, resolveTheme } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onRefreshAll: () => void;
  onNavigate?: (tab: any) => void;
  onBack?: () => void;
  previousTab?: string;
  onLockApp?: () => void;
}

const AVATAR_PRESETS = [
  { name: 'Executive Leader', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { name: 'Master Craftsman', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { name: 'Merchant Partner', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { name: 'Store Director', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
];

const WALLPAPER_PRESETS = [
  { name: 'Luxury Leather Workshop', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Italian Brass Buckles', url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Dark Saddle Hide', url: 'https://images.unsplash.com/photo-1585856345914-72648585489f?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Vintage Craftsmanship', url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=1200&auto=format&fit=crop&q=80' },
];

const FAQ_ITEMS = [
  {
    q: 'How do I scan belt barcodes using the device camera?',
    a: 'In both POS Sales and Stock Audit views, tap the "Scan Barcode" button. Allow camera permissions and point your phone or webcam at the belt tag. The app uses hardware barcode detection to instantly identify the product, play a confirmation beep, and populate the checkout or audit details.',
  },
  {
    q: 'How does automated GST / VAT calculation work?',
    a: 'Under the Tax Management section below, specify your GST or VAT rate (e.g. 17% FBR GST, 13% Sindh SRB, 18% standard VAT). You can choose between "Exclusive" (tax added on top of the belt price) or "Inclusive" (tax absorbed within retail price). The app automatically breaks down the tax on POS receipts and WhatsApp invoices.',
  },
  {
    q: 'Can I use Saqib Belt offline without internet?',
    a: 'Yes! Saqib Belt is engineered with an offline-first architecture. All belt catalog items, sales records, customer Udhar ledgers, and purchases are stored locally on your device with instant sub-millisecond response. You can also download full JSON backups anytime.',
  },
  {
    q: 'How do I track customer credit (Udhar) and payments?',
    a: 'When making a POS sale, enter the amount received from the customer. Any balance is automatically logged to that customer\'s Udhar ledger. Visit the "Customers" tab to record partial recoveries or print ledger statements.',
  },
  {
    q: 'How do I install the app on an Android phone as an APK?',
    a: 'Visit the "Android APK" tab from the header or navigation menu. You can download the complete production-ready Android Studio project ZIP containing Kotlin and Jetpack Compose code with Biometric PIN lock support.',
  },
];

export const SettingsView: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onRefreshAll,
  onNavigate,
  onBack,
  previousTab = 'dashboard',
  onLockApp,
}) => {
  const t = translations[settings.language];
  const currentTheme = resolveTheme(settings.theme);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Active section tab for navigation
  const [activeSection, setActiveSection] = useState<'all' | 'profile' | 'theme' | 'language' | 'notifications' | 'security' | 'tax' | 'backup' | 'info' | 'support'>('all');

  // Profile state
  const [profile, setProfile] = useState<UserProfile>(() => settings.profile || {
    name: 'Saqib Khan',
    email: 'saqib@saqibbelts.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    phone: '+92 300 1234567',
    role: 'Administrator & Founder',
    bio: 'Premium Wholesale & Retail Leather Belt Merchant · Lahore, Pakistan',
  });
  const [profileSuccessNotice, setProfileSuccessNotice] = useState(false);

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>(() => settings.notifications || {
    enabled: true,
    lowStockAlerts: true,
    dailySalesTarget: true,
    cloudSyncUpdates: true,
    backupReminders: true,
    soundAlerts: true,
  });
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // PIN & Password Change State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Backup & Restore State
  const [backupMsg, setBackupMsg] = useState<{ type: 'success' | 'error'; text: string; details?: any } | null>(null);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [backupStats, setBackupStats] = useState(() => db.getBackupSummary());
  const [pendingRestoreData, setPendingRestoreData] = useState<{
    rawJson: string;
    version: string;
    exportedAt?: string;
    productsCount: number;
    salesCount: number;
    purchasesCount: number;
    customersCount: number;
    suppliersCount: number;
    expensesCount: number;
  } | null>(null);

  // Help & Support Inquiry form
  const [supportName, setSupportName] = useState(profile.name || 'Saqib Khan');
  const [supportEmail, setSupportEmail] = useState(profile.email || 'saqib@saqibbelts.com');
  const [supportSubject, setSupportSubject] = useState('Inquiry');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Tax Management State
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(() => settings.tax || {
    enabled: true,
    name: 'GST',
    rate: 17,
    taxNumber: 'STRN-3277876192834',
    isInclusive: false,
  });
  const [taxSavedNotice, setTaxSavedNotice] = useState(false);
  const [sampleSaleAmount, setSampleSaleAmount] = useState<number>(2500);

  // Wallpaper adjustment states
  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(settings.wallpaper);

  // Save Profile Handler
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSettings({ profile });
    setProfileSuccessNotice(true);
    setTimeout(() => setProfileSuccessNotice(false), 3000);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          const updated = { ...profile, avatarUrl: url };
          setProfile(updated);
          onUpdateSettings({ profile: updated });
          setProfileSuccessNotice(true);
          setTimeout(() => setProfileSuccessNotice(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Notification Toggles Handler
  const handleUpdateNotifications = (updates: Partial<NotificationSettings>) => {
    const updated = { ...notifications, ...updates };
    setNotifications(updated);
    onUpdateSettings({ notifications: updated });
  };

  // Test notification sound and toast
  const handleTestNotification = () => {
    if (notifications.soundAlerts) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(660, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {
        // audio unavailable
      }
    }
    setNotificationToast('🔔 Test notification: System alerts & sound are working properly!');
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Tax handler
  const handleUpdateTax = (updates: Partial<TaxConfig>) => {
    const updated = { ...taxConfig, ...updates };
    setTaxConfig(updated);
    onUpdateSettings({ tax: updated });
    setTaxSavedNotice(true);
    setTimeout(() => setTaxSavedNotice(false), 2500);
  };

  // Wallpaper Handlers
  const handleSaveWallpaper = (updates: Partial<WallpaperConfig>) => {
    const updated = { ...wallpaper, ...updates };
    setWallpaper(updated);
    onUpdateSettings({ wallpaper: updated });
  };

  const handleWallpaperFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          handleSaveWallpaper({ imageUrl: url, isCustom: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetWallpaper = () => {
    const reset = {
      imageUrl: '',
      brightness: 100,
      blur: 0,
      overlayOpacity: 70,
      isCustom: false,
    };
    setWallpaper(reset);
    onUpdateSettings({ wallpaper: reset });
  };

  // PIN Change Form Handler
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    // If PIN currently enabled, check current PIN
    if (settings.security.pinEnabled && currentPinInput !== settings.security.pinCode) {
      setPinError('Current PIN does not match. Please enter your existing PIN.');
      return;
    }

    if (newPin.length < 4 || newPin.length > 6) {
      setPinError('New PIN must be between 4 and 6 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and confirmation PIN do not match.');
      return;
    }

    onUpdateSettings({
      security: {
        ...settings.security,
        pinCode: newPin,
      },
    });

    setCurrentPinInput('');
    setNewPin('');
    setConfirmPin('');
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 4000);
  };

  // Backup & Restore Handlers
  const handleDownloadBackup = () => {
    const jsonStr = db.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `SAQIB_Belt_Database_Backup_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    const updatedStats = db.getBackupSummary();
    setBackupStats(updatedStats);
    setBackupMsg({
      type: 'success',
      text: `Database state exported successfully as JSON file (${updatedStats.productsCount} belts, ${updatedStats.salesCount} sales, ${updatedStats.purchasesCount} purchases). Business continuity secured!`,
    });
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (!parsed.products || !Array.isArray(parsed.products)) {
          setBackupMsg({
            type: 'error',
            text: 'Invalid backup JSON file: missing required belt catalog records collection.',
          });
          return;
        }

        // Open verification modal with file inspection before committing
        setPendingRestoreData({
          rawJson: content,
          version: parsed.version || '1.0.0',
          exportedAt: parsed.exportedAt,
          productsCount: Array.isArray(parsed.products) ? parsed.products.length : 0,
          salesCount: Array.isArray(parsed.sales) ? parsed.sales.length : 0,
          purchasesCount: Array.isArray(parsed.purchases) ? parsed.purchases.length : 0,
          customersCount: Array.isArray(parsed.customers) ? parsed.customers.length : 0,
          suppliersCount: Array.isArray(parsed.suppliers) ? parsed.suppliers.length : 0,
          expensesCount: Array.isArray(parsed.expenses) ? parsed.expenses.length : 0,
        });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setBackupMsg({
          type: 'error',
          text: `Failed to parse backup JSON file: ${errMsg}`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingRestoreData) return;
    const res = db.restoreBackup(pendingRestoreData.rawJson);
    if (res.success) {
      setBackupMsg({
        type: 'success',
        text: `Database state restored successfully! Recovered ${res.details?.productsCount || 0} catalog belts, ${res.details?.salesCount || 0} POS sales, ${res.details?.purchasesCount || 0} purchases, and ${res.details?.customersCount || 0} customer ledgers. Business continuity verified.`,
      });
      setPendingRestoreData(null);
      setBackupStats(db.getBackupSummary());
      onRefreshAll();
    } else {
      setBackupMsg({
        type: 'error',
        text: res.message,
      });
      setPendingRestoreData(null);
    }
  };

  // Support inquiry submission
  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSupportSubmitted(ticketId);
    setSupportMessage('');
  };

  const getPreviousTabLabel = () => {
    switch (previousTab) {
      case 'sales': return 'POS Sales';
      case 'products': return 'Products';
      case 'stock': return 'Stock & Audit';
      case 'purchases': return 'Purchases';
      case 'profit_loss': return 'Profit & Loss';
      case 'ledgers': return 'Customers';
      case 'expenses': return 'Expenses';
      case 'reports': return 'Reports';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Navigation Bar with Back Button & Screen Title */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
              title={`Return to ${getPreviousTabLabel()}`}
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold hidden md:inline">Back to {getPreviousTabLabel()}</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
                Settings &amp; Preferences
              </h2>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                Saqib Belt
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Manage profile, appearance themes, languages, alerts, PIN security, tax rates, and support
            </p>
          </div>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2">
          {onLockApp && settings.security.pinEnabled && (
            <button
              type="button"
              onClick={onLockApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 border border-neutral-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Lock screen with PIN now"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lock App</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
            <img
              src={profile.avatarUrl || AVATAR_PRESETS[0].url}
              alt={profile.name}
              className="w-6 h-6 rounded-full object-cover border border-amber-500/40"
            />
            <span className="font-semibold text-neutral-200 truncate max-w-[100px] sm:max-w-[130px]">
              {profile.name}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Section Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: 'All Settings', icon: FileText },
          { id: 'profile', label: '1. Profile', icon: User },
          { id: 'theme', label: '2. Themes', icon: Palette },
          { id: 'language', label: '3. Language', icon: Globe },
          { id: 'notifications', label: '4. Notifications', icon: Bell },
          { id: 'security', label: '5. Privacy & Security', icon: Shield },
          { id: 'tax', label: '6. Tax Rates', icon: Percent },
          { id: 'backup', label: '7. Local Backup', icon: Database },
          { id: 'info', label: '8. App Info', icon: Info },
          { id: 'support', label: '9. Help & Support', icon: HelpCircle },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-900/70 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Alerts / Toasts */}
      {notificationToast && (
        <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between shadow-lg animate-fade-in font-medium">
          <span>{notificationToast}</span>
          <button onClick={() => setNotificationToast(null)} className="text-amber-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {backupMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-lg animate-fade-in ${
            backupMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/80 border-red-500/50 text-red-200'
          }`}
        >
          <span>{backupMsg.text}</span>
          <button onClick={() => setBackupMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. PROFILE SETTINGS */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'profile') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                  <span>Profile Settings</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-sans font-medium">
                    Owner Account
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  View and edit your personal details, merchant designation, contact information, and avatar
                </p>
              </div>
            </div>

            {profileSuccessNotice && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile Changes Saved!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar & Photo Picker */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
              <div className="relative group">
                <img
                  src={profile.avatarUrl || AVATAR_PRESETS[0].url}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
                >
                  <Camera className="w-5 h-5 mb-1 text-amber-400" />
                  <span>Upload</span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileSelect}
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="font-bold text-sm text-neutral-200">Profile Picture</div>
                <p className="text-[11px] text-neutral-400">
                  Upload an image from your device or select from artisanal merchant presets below.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload New Photo</span>
                  </button>

                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfile({ ...profile, avatarUrl: preset.url })}
                      className={`relative w-8 h-8 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        profile.avatarUrl === preset.url
                          ? 'border-amber-400 ring-2 ring-amber-400'
                          : 'border-neutral-700 hover:border-neutral-500'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 font-semibold focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. Saqib Khan"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. saqib@saqibbelts.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 font-mono focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. +92 300 1234567"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={profile.role || ''}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Administrator & Founder"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-300 mb-1">
                  Merchant Bio / Business Tagline
                </label>
                <input
                  type="text"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Premium Wholesale & Retail Leather Belt Merchant · Lahore, Pakistan"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. THEME SETTINGS (Light, Dark, System, Luxury) */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'theme') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                <span>Theme &amp; Appearance Settings</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-bold">
                  Active: {themes[settings.theme]?.name || 'Custom'}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Light Mode, Dark Mode, System Default, and curated luxury leather palettes applied throughout the entire app
              </p>
            </div>
          </div>

          {/* Primary 3 Themes: Light, Dark, System */}
          <div>
            <div className="text-xs font-bold text-neutral-300 mb-2.5">
              Standard Display Modes:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'light' as ThemeId,
                  title: 'Light Mode',
                  subtitle: 'Clean white ledger with crisp high contrast slate borders',
                  icon: Sun,
                  bg: 'bg-white text-slate-900 border-slate-300',
                  accentColor: '#0284c7',
                },
                {
                  id: 'dark' as ThemeId,
                  title: 'Dark Mode',
                  subtitle: 'Modern obsidian carbon with gentle eye-relief low glare',
                  icon: Moon,
                  bg: 'bg-[#090a0f] text-neutral-100 border-neutral-800',
                  accentColor: '#64748b',
                },
                {
                  id: 'system' as ThemeId,
                  title: 'System Default',
                  subtitle: 'Automatically synchronizes with your device or OS color scheme',
                  icon: Smartphone,
                  bg: 'bg-slate-900 text-indigo-100 border-slate-700',
                  accentColor: '#6366f1',
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = settings.theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: item.id })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-amber-400 bg-neutral-900/90 shadow-lg ring-2 ring-amber-400'
                        : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 p-1 rounded-full bg-amber-400 text-neutral-950">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-neutral-100">{item.title}</div>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Artisanal Leather Presets */}
          <div>
            <div className="text-xs font-bold text-neutral-300 mb-2.5">
              Artisanal Leather Palettes:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                themes.black_gold,
                themes.brown_black,
                themes.blue_white,
                themes.green_white,
                themes.purple,
              ].map((th) => {
                const isSelected = settings.theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: th.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-amber-400 bg-neutral-900 shadow-md ring-2 ring-amber-400'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 p-0.5 rounded-full bg-amber-400 text-neutral-950">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: th.primary }} />
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: th.accent }} />
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: th.bgHex }} />
                    </div>
                    <div className="font-bold text-xs text-neutral-100 truncate">{th.name.split(' (')[0]}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 truncate">{th.nameUrdu}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Wallpaper Studio */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-neutral-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Custom Gallery Wallpaper Studio</span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Set background leather wallpaper with interactive brightness, blur, and opacity adjustments
                </div>
              </div>
              {wallpaper.isCustom && (
                <button
                  type="button"
                  onClick={handleResetWallpaper}
                  className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Wallpaper</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WALLPAPER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSaveWallpaper({ imageUrl: preset.url, isCustom: true })}
                  className={`relative h-18 rounded-xl overflow-hidden border cursor-pointer ${
                    wallpaper.imageUrl === preset.url
                      ? 'border-amber-400 ring-2 ring-amber-400'
                      : 'border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => wallpaperInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload From Device Gallery</span>
              </button>
              <input
                ref={wallpaperInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleWallpaperFileSelect}
              />
            </div>

            {wallpaper.isCustom && (
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Brightness: {wallpaper.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={wallpaper.brightness}
                    onChange={(e) => handleSaveWallpaper({ brightness: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Blur: {wallpaper.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={wallpaper.blur}
                    onChange={(e) => handleSaveWallpaper({ blur: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Dark Tint Tint: {wallpaper.overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={wallpaper.overlayOpacity}
                    onChange={(e) => handleSaveWallpaper({ overlayOpacity: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. LANGUAGE SETTINGS (English, Urdu, Roman Urdu) */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'language') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
          <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                <span>Language Settings (زبان کی ترتیبات)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-sans font-semibold">
                  {settings.language === 'en' ? 'English' : settings.language === 'ur' ? 'اردو' : 'Roman Urdu'}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Supports full English, Urdu with Right-to-Left (RTL) Nastaliq alignment, and Roman Urdu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'en' as Language,
                title: 'English',
                tag: 'Standard Latin',
                desc: 'Full English interface with standard Left-to-Right layout and international formatting.',
              },
              {
                id: 'ur' as Language,
                title: 'اردو (Urdu)',
                tag: 'دائیں سے بائیں (RTL)',
                desc: 'مکمل اردو انٹرفیس، نفیس نستعلیق فونٹ اور مقامی کھاتہ داری اصطلاحات۔',
              },
              {
                id: 'roman_ur' as Language,
                title: 'Roman Urdu',
                tag: 'Aasaani Se Parhein',
                desc: 'Aasaan Roman Urdu alfaz (e.g. Udhar, Kharidari, Munafa, Mal ki Quantity).',
              },
            ].map((lang) => {
              const isSelected = settings.language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onUpdateSettings({ language: lang.id })}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/15 shadow-md ring-2 ring-amber-400'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 p-1 rounded-full bg-amber-400 text-neutral-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  <div className="font-bold text-sm text-neutral-100">{lang.title}</div>
                  <span className="text-[10px] text-amber-400 font-mono inline-block my-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {lang.tag}
                  </span>
                  <div className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {lang.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. NOTIFICATION SETTINGS */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'notifications') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                  <span>Notification Settings</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    notifications.enabled
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {notifications.enabled ? 'Enabled' : 'Muted'}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Configure alerts for low inventory stock, daily sales targets, cloud sync updates, and audio feedback
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 cursor-pointer shadow-sm active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Alert &amp; Sound</span>
            </button>
          </div>

          {/* Master Enable / Disable Toggle */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-neutral-200">Master Notifications Switch</div>
              <div className="text-xs text-neutral-400">
                Enable or disable all in-app toasts, stock threshold badges, and audio chime alerts
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.enabled}
                onChange={(e) => handleUpdateNotifications({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Individual Notification Toggles */}
          <div className={`space-y-3 ${notifications.enabled ? '' : 'opacity-40 pointer-events-none'}`}>
            <div className="text-xs font-bold text-neutral-300">
              Notification Channels &amp; Triggers:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Low Stock Alerts */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Low Stock Warnings</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Badge &amp; banner when any belt quantity drops to or below minimum stock level
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.lowStockAlerts}
                  onChange={(e) => handleUpdateNotifications({ lowStockAlerts: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Daily Sales Target */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Daily Sales Target Milestones</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Celebrate reaching 50%, 75%, and 100% of your daily revenue target
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailySalesTarget}
                  onChange={(e) => handleUpdateNotifications({ dailySalesTarget: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Cloud Sync Updates */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Cloud Sync &amp; Drive Alerts</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Notification when Google Drive backup or peer server sync completes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.cloudSyncUpdates}
                  onChange={(e) => handleUpdateNotifications({ cloudSyncUpdates: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Backup Reminders */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Weekly Backup Reminders</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Gentle reminder to download a fresh database snapshot every 7 days
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.backupReminders}
                  onChange={(e) => handleUpdateNotifications({ backupReminders: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Sound Alerts */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between gap-3 sm:col-span-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sound Effects &amp; Scan Beeps</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Play pleasant audio chimes on successful barcode scan and POS checkout confirmation
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.soundAlerts}
                  onChange={(e) => handleUpdateNotifications({ soundAlerts: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 5. PRIVACY & SECURITY SETTINGS */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'security') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                  <span>Privacy &amp; Security Settings</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    settings.security.pinEnabled
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950 border border-red-500/50 text-red-300'
                  }`}>
                    {settings.security.pinEnabled ? 'PIN Protected' : 'PIN Unprotected'}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Configure 4-digit PIN lock, biometric hardware access, privacy obscuring mode, and session locking
                </p>
              </div>
            </div>

            {onLockApp && (
              <button
                type="button"
                onClick={onLockApp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold transition-all cursor-pointer shadow active:scale-95 whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Lock App Now / Logout Session</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* PIN Master Toggle & Auto-Lock timeout */}
            <div className="space-y-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-200">Require PIN Lock On Launch</div>
                  <div className="text-[11px] text-neutral-400">
                    Locks app and prompts for security PIN whenever reopened or refreshed
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.pinEnabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      security: { ...settings.security, pinEnabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Privacy Mode: Mask Profit & Financial Figures */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                    {settings.privacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
                    <span>Privacy Mode (Mask Sensitive Profits)</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Obscures gross profit amounts on counter screens to prevent customers from seeing margins
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.privacyMode}
                  onChange={(e) => onUpdateSettings({ privacyMode: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Auto-Lock Timeout */}
              <div className="pt-3 border-t border-neutral-800 space-y-1.5">
                <label className="block font-semibold text-neutral-300">
                  Auto-Lock Inactivity Timeout
                </label>
                <select
                  value={settings.security.autoLockMinutes}
                  onChange={(e) =>
                    onUpdateSettings({
                      security: { ...settings.security, autoLockMinutes: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-medium cursor-pointer"
                >
                  <option value={0}>Immediate (Whenever app is closed or tab is hidden)</option>
                  <option value={1}>1 Minute of Inactivity</option>
                  <option value={5}>5 Minutes of Inactivity</option>
                  <option value={15}>15 Minutes of Inactivity</option>
                  <option value={-1}>Never Auto-Lock (Manual Only)</option>
                </select>
              </div>

              {/* Biometrics */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-200">AndroidX Fingerprint / Face Unlock</div>
                  <div className="text-[11px] text-neutral-400">
                    Enables hardware biometric scanner integration on supported mobile devices
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.biometricEnabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      security: { ...settings.security, biometricEnabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Change Password / PIN Form */}
            <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-3">
              <div className="font-bold text-sm text-neutral-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Change Security PIN / Password</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Update the 4-6 digit numeric code used to unlock the terminal and access sensitive owner ledgers.
              </p>

              {pinError && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {pinSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Security PIN successfully updated!</span>
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-3 pt-1">
                {settings.security.pinEnabled && (
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Current PIN Code
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="Enter current PIN (Default: 1234)"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-mono tracking-widest text-center"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      New PIN (4-6 digits)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="New PIN (e.g. 5678)"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-mono tracking-widest text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Repeat New PIN"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
                  >
                    Update Security PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. TAX MANAGEMENT (GST / VAT Rates) */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'tax') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                  <span>Tax Management (GST / VAT / Sales Tax)</span>
                  {taxConfig.enabled ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-sans font-semibold">
                      Active ({taxConfig.rate}% {taxConfig.name})
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-sans font-semibold">
                      Disabled
                    </span>
                  )}
                </h3>
                <p className="text-xs text-neutral-400">
                  Define custom tax rates, calculation rules (Exclusive or Inclusive), and registration STRN/NTN numbers
                </p>
              </div>
            </div>

            {taxSavedNotice && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tax Settings Saved!</span>
              </div>
            )}
          </div>

          {/* Master Toggle */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-neutral-200">Enable Automated Sales Tax Calculation</div>
              <div className="text-xs text-neutral-400">
                When turned on, POS sales and invoices will automatically compute and display the applicable GST/VAT breakdown.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={taxConfig.enabled}
                onChange={(e) => handleUpdateTax({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {taxConfig.enabled && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2.5">
                  <label className="block font-bold text-neutral-200">
                    Tax Nomenclature / Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['GST', 'VAT', 'Sales Tax'].map((nameOption) => (
                      <button
                        key={nameOption}
                        type="button"
                        onClick={() => handleUpdateTax({ name: nameOption })}
                        className={`py-2 px-2 rounded-lg font-bold text-center border transition-all cursor-pointer ${
                          taxConfig.name === nameOption
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow'
                            : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {nameOption}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1">
                    <span className="text-[11px] text-neutral-400">Or custom tax name:</span>
                    <input
                      type="text"
                      value={taxConfig.name}
                      onChange={(e) => handleUpdateTax({ name: e.target.value })}
                      placeholder="e.g. SRB / PRA / PST"
                      className="w-full mt-1 px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-semibold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2.5">
                  <label className="block font-bold text-neutral-200">
                    Tax Registration No. (STRN / NTN / VAT ID)
                  </label>
                  <input
                    type="text"
                    value={taxConfig.taxNumber || ''}
                    onChange={(e) => handleUpdateTax({ taxNumber: e.target.value })}
                    placeholder="e.g. STRN-3277876192834 or NTN-9876543-2"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100 placeholder:text-neutral-600"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Printed on receipts and invoices under business information to satisfy regulatory requirements.
                  </p>
                </div>
              </div>

              {/* Custom Tax Rate & Quick Presets */}
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-neutral-200">
                      Applicable Tax Rate (%)
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Define any custom percentage rate to apply automatically across all belt sales.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={taxConfig.rate}
                        onChange={(e) => handleUpdateTax({ rate: Math.max(0, Number(e.target.value)) })}
                        className="w-24 px-3 py-2 bg-neutral-950 border border-amber-500/70 rounded-xl font-mono text-lg font-black text-amber-400 text-center"
                      />
                      <span className="absolute right-3 top-2.5 text-neutral-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 mb-1.5 block">
                    Quick Standard Rates:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '0% Exempt', rate: 0 },
                      { label: '5% Concessional', rate: 5 },
                      { label: '10% Reduced', rate: 10 },
                      { label: '13% Sindh SRB', rate: 13 },
                      { label: '16% Punjab PRA', rate: 16 },
                      { label: '17% Standard GST', rate: 17 },
                      { label: '18% Standard VAT', rate: 18 },
                    ].map((preset) => (
                      <button
                        key={preset.rate}
                        type="button"
                        onClick={() => handleUpdateTax({ rate: preset.rate })}
                        className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                          taxConfig.rate === preset.rate
                            ? 'bg-amber-500 text-neutral-950 shadow'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exclusive vs Inclusive mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => handleUpdateTax({ isInclusive: false })}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    !taxConfig.isInclusive
                      ? 'border-amber-400 bg-amber-500/10 shadow ring-1 ring-amber-400'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-neutral-100 flex items-center justify-between">
                    <span>Tax Exclusive (Added on top)</span>
                    {!taxConfig.isInclusive && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Invoice calculates net subtotal, adds {taxConfig.rate}% {taxConfig.name}, producing a higher gross total bill. (Recommended for wholesale)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateTax({ isInclusive: true })}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    taxConfig.isInclusive
                      ? 'border-amber-400 bg-amber-500/10 shadow ring-1 ring-amber-400'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-neutral-100 flex items-center justify-between">
                    <span>Tax Inclusive (Included in retail price)</span>
                    {taxConfig.isInclusive && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Selling price already contains tax. Invoice extracts and displays the {taxConfig.rate}% tax portion without increasing total price.
                  </p>
                </button>
              </div>

              {/* Live Tax Simulator */}
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-300 font-sans font-bold">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>Live Invoice Tax Simulator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 text-[11px]">Test Belt Bill: Rs.</span>
                    <input
                      type="number"
                      value={sampleSaleAmount}
                      onChange={(e) => setSampleSaleAmount(Math.max(0, Number(e.target.value)))}
                      className="w-20 px-2 py-0.5 bg-neutral-900 border border-neutral-700 rounded text-amber-300 text-right font-mono"
                    />
                  </div>
                </div>

                {(() => {
                  const net = sampleSaleAmount;
                  let taxAmt = 0;
                  let finalTotal = net;
                  if (!taxConfig.isInclusive) {
                    taxAmt = Math.round(net * (taxConfig.rate / 100));
                    finalTotal = net + taxAmt;
                  } else {
                    taxAmt = Math.round(net - net / (1 + taxConfig.rate / 100));
                    finalTotal = net;
                  }
                  return (
                    <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                      <div className="flex justify-between text-neutral-400">
                        <span>Sale Base Amount:</span>
                        <span>Rs. {net.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-amber-400 font-semibold">
                        <span>+ {taxConfig.name} ({taxConfig.rate}% {taxConfig.isInclusive ? 'Included' : 'Exclusive'}):</span>
                        <span>Rs. {taxAmt.toLocaleString()}</span>
                      </div>
                      <div className="pt-1.5 border-t border-neutral-800 flex justify-between text-neutral-100 font-bold text-sm">
                        <span>Final Customer Total:</span>
                        <span className="text-amber-400">Rs. {finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* 7. LOCAL BACKUP (Export & Restore for Business Continuity) */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'backup') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                  <span>Local Backup</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-sans font-semibold">
                    Business Continuity
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Export the current database state as a JSON file and use the corresponding Restore Backup button to import data, ensuring business continuity without internet reliance
                </p>
              </div>
            </div>

            {backupStats.lastBackupDate ? (
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 bg-neutral-900/80 px-3 py-1.5 rounded-xl border border-neutral-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Last Exported: {new Date(backupStats.lastBackupDate).toLocaleDateString()} {new Date(backupStats.lastBackupDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) : (
              <div className="text-[11px] text-amber-400 flex items-center gap-1.5 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>No local export generated yet</span>
              </div>
            )}
          </div>

          {/* Current Database State & Health Metrics */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-200">Current Database State Summary:</span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Storage Active (Offline Ready)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-center">
                <span className="text-[10px] text-neutral-400 block">Belts in Stock</span>
                <span className="text-sm font-mono font-bold text-amber-400">{backupStats.productsCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-center">
                <span className="text-[10px] text-neutral-400 block">Sales Invoices</span>
                <span className="text-sm font-mono font-bold text-neutral-100">{backupStats.salesCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-center">
                <span className="text-[10px] text-neutral-400 block">Inward Purchases</span>
                <span className="text-sm font-mono font-bold text-neutral-100">{backupStats.purchasesCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-center">
                <span className="text-[10px] text-neutral-400 block">Customer Ledgers</span>
                <span className="text-sm font-mono font-bold text-neutral-100">{backupStats.customersCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-center">
                <span className="text-[10px] text-neutral-400 block">Suppliers</span>
                <span className="text-sm font-mono font-bold text-neutral-100">{backupStats.suppliersCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-center">
                <span className="text-[10px] text-neutral-400 block">Business Expenses</span>
                <span className="text-sm font-mono font-bold text-neutral-100">{backupStats.expensesCount}</span>
              </div>
            </div>
          </div>

          {/* Action Cards: Export Database as JSON File & Restore Backup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 1. Export Current Database State */}
            <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-100">Export Database (JSON File)</h4>
                    <span className="text-[10px] text-emerald-400 font-medium">Standalone Snapshot</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Export the current database state as a portable JSON file to your device storage. Includes all belt products, customer credit ledgers, purchase cost histories, and system configurations.
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-300 pt-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant offline download to laptop or phone</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Timestamped backup name: <code>SAQIB_Belt_Database_Backup.json</code></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Guarantees complete business continuity</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Database as JSON</span>
              </button>
            </div>

            {/* 2. Restore Backup (Import Data) */}
            <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-100">Restore Backup</h4>
                    <span className="text-[10px] text-amber-400 font-medium">Import Saved JSON</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Import a previously exported JSON backup file to restore all catalog belts, customer balances, and transaction records onto this device or counter terminal.
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-300 pt-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Automated JSON schema validation &amp; verification</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Live record preview before confirming overwrite</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Seamless device migration &amp; data recovery</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-amber-500/40 text-amber-300 hover:text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Restore Backup</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreFile}
                />
              </div>
            </div>
          </div>

          {/* Business Continuity Security & Cloud Sync Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Cloud className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-neutral-200">Continuous Multi-Terminal Sync (Google Drive &amp; LAN)</div>
                <div className="text-[11px] text-neutral-400 leading-relaxed">
                  In addition to manual JSON backups, connect Google Drive or private peer syncing to mirror backups automatically every time a transaction occurs.
                </div>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('cloud_sync')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer whitespace-nowrap shadow-sm active:scale-95 self-end sm:self-center"
              >
                Open Cloud Sync →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 8. APP INFORMATION (Saqib Belt, Version, About) */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'info') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-neutral-100 flex items-center gap-2">
                <span>App Information</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  v2.4.0
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Official specifications, architecture, founding partners, and software licensing details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Application Name</div>
              <div className="text-lg font-brand font-extrabold text-amber-400">Saqib Belt</div>
              <div className="text-[11px] text-neutral-300">
                SAQIB Belt Business Manager · Enterprise Edition
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Current Version</div>
              <div className="text-lg font-mono font-black text-neutral-100">v2.4.0 PRO</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>Up to date · Offline-First Engine</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Partnership</div>
              <div className="text-sm font-bold text-neutral-200">Saqib · Adil · Javaid</div>
              <div className="text-[11px] text-neutral-400">
                Equal Equity Leather Distribution Firm
              </div>
            </div>
          </div>

          {/* About App Section */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3 text-xs leading-relaxed text-neutral-300">
            <div className="font-bold text-sm text-neutral-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>About Saqib Belt Software</span>
            </div>
            <p>
              <strong>Saqib Belt</strong> is a tailored, industrial-grade inventory management and Point-of-Sale (POS) ERP solution built specifically for wholesale and retail leather belt merchants. Designed to replace paper ledgers (Khata books), it delivers instant thermal receipt generation, camera barcode scanning, automatic GST/VAT calculation, real-time inventory stock alerts, and multi-partner double-entry accounting.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block">Platform:</span>
                <span className="text-neutral-200 font-bold">Web SPA &amp; Android APK</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block">Database:</span>
                <span className="text-neutral-200 font-bold">Local IndexedDB/JSON</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block">Currency:</span>
                <span className="text-amber-400 font-bold">PKR (Pakistani Rupee)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block">Security:</span>
                <span className="text-emerald-400 font-bold">PIN &amp; Biometric Lock</span>
              </div>
            </div>
            <div className="pt-2 text-[10px] text-neutral-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-neutral-800/80">
              <span>© {new Date().getFullYear()} Saqib Belt Business. All rights reserved.</span>
              <span>Crafted for Pakistani Leather Bazaars &amp; Wholesale Hubs</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 9. HELP & SUPPORT */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'support') && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-5`}>
          <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-neutral-100">
                Help &amp; Support Center
              </h3>
              <p className="text-xs text-neutral-400">
                Knowledge base FAQ guides, direct phone/WhatsApp contact, and in-app support ticket submission
              </p>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <a
              href="https://wa.me/923001234567?text=Hello%20Saqib%20Belt%20Support,%20I%20need%20assistance%20with%20the%20app."
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-500/40 text-emerald-200 transition-all flex items-center gap-3 cursor-pointer group shadow"
            >
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-emerald-100 flex items-center gap-1">
                  <span>WhatsApp Chat</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </div>
                <div className="text-[11px] text-emerald-300/80">+92 300 1234567</div>
              </div>
            </a>

            <a
              href="tel:+923001234567"
              className="p-4 rounded-xl bg-blue-950/60 hover:bg-blue-950 border border-blue-500/40 text-blue-200 transition-all flex items-center gap-3 cursor-pointer group shadow"
            >
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-blue-100 flex items-center gap-1">
                  <span>Phone Support</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </div>
                <div className="text-[11px] text-blue-300/80">Mon - Sat (9am - 8pm)</div>
              </div>
            </a>

            <a
              href="mailto:support@saqibbelts.com?subject=Saqib%20Belt%20App%20Support%20Request"
              className="p-4 rounded-xl bg-purple-950/60 hover:bg-purple-950 border border-purple-500/40 text-purple-200 transition-all flex items-center gap-3 cursor-pointer group shadow"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-purple-100 flex items-center gap-1">
                  <span>Email Help Desk</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </div>
                <div className="text-[11px] text-purple-300/80">support@saqibbelts.com</div>
              </div>
            </a>
          </div>

          {/* Help Center FAQ Accordion */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Frequently Asked Questions &amp; User Manual</span>
            </div>

            <div className="space-y-2">
              {FAQ_ITEMS.map((item, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden text-xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full p-3.5 text-left font-bold text-neutral-200 hover:text-amber-400 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? 'rotate-90 text-amber-400' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 text-neutral-400 text-[11px] leading-relaxed border-t border-neutral-800/80 pt-2.5 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* In-App Support Ticket Form */}
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-3 text-xs">
            <div className="font-bold text-sm text-neutral-200 flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Send Support Ticket / Feedback</span>
            </div>

            {supportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 space-y-2 animate-fade-in">
                <div className="font-bold flex items-center gap-2 text-sm text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Support Ticket Submitted Successfully!</span>
                </div>
                <p className="text-[11px]">
                  Your Ticket ID is <strong className="font-mono text-white bg-black/50 px-2 py-0.5 rounded border border-emerald-500/40">{supportSubmitted}</strong>. Our engineering and merchant team has received your inquiry and will follow up with you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSupportSubmitted(null)}
                  className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSupport} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={supportName}
                      onChange={(e) => setSupportName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Email / Phone</label>
                    <input
                      type="text"
                      required
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Subject</label>
                    <select
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
                    >
                      <option value="Inquiry">General Inquiry</option>
                      <option value="POS Help">POS Sales &amp; Invoices</option>
                      <option value="Barcode Issue">Barcode Camera Scanner</option>
                      <option value="GST Tax">GST / VAT Rates</option>
                      <option value="Feature Request">Feature Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Message / Question</label>
                  <textarea
                    rows={3}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe how we can assist you with your belt inventory or accounting..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 resize-none focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 10. RESTART FRESH / ERASE ALL DATA */}
      {/* ========================================== */}
      {(activeSection === 'all' || activeSection === 'backup') && (
        <div className="p-5 sm:p-6 rounded-2xl border border-red-500/40 bg-red-950/20 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-950 border border-red-500/50 text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-red-200">
                  {t.restartApp}
                </h3>
                <p className="text-xs text-red-300/80">
                  Wipes all catalog belts, POS invoices, purchases, expenses, and customer ledgers for a clean start
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRestartModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.restartApp}</span>
            </button>
          </div>
        </div>
      )}

      {/* RESTART CONFIRMATION MODAL */}
      {isRestartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-md bg-neutral-900 border border-red-500/60 rounded-2xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-950 border border-red-500/50 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100">
                  {t.restartConfirmTitle}
                </h3>
                <p className="text-neutral-400 text-xs">Erase all records &amp; restart with blank database</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 space-y-2 leading-relaxed">
              <p className="font-semibold text-xs">⚠️ Warning: The following records will be permanently erased:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-300">
                <li>All Belt Catalog Products and Inventory Stock Counts</li>
                <li>All Inward Purchase Bills &amp; Supplier Balances</li>
                <li>All POS Sales Invoices &amp; Customer Udhar Balances</li>
                <li>All Stock Movement Logs &amp; Damaged Write-offs</li>
                <li>All Business Expenses &amp; Historical P&amp;L Records</li>
              </ul>
              <p className="pt-1 text-[11px] text-neutral-300">
                Your profile, theme, language, and security settings will remain intact.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRestartModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  db.eraseAllData();
                  setIsRestartModalOpen(false);
                  onRefreshAll();
                  setBackupMsg({
                    type: 'success',
                    text: t.restartSuccess,
                  });
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-lg cursor-pointer active:scale-95"
              >
                Yes, Erase All Data &amp; Restart Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE BACKUP VERIFICATION & CONFIRMATION MODAL */}
      {pendingRestoreData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-md bg-neutral-900 border border-amber-500/60 rounded-2xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-neutral-100">
                  Restore Backup Verification
                </h3>
                <p className="text-neutral-400 text-xs">Verify database snapshot records before importing</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="text-[11px] text-neutral-300 font-medium">
                JSON schema validated. The following records will be restored into your local database:
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Belts Catalog:</span>
                  <span className="font-bold text-amber-400">{pendingRestoreData.productsCount}</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">POS Sales:</span>
                  <span className="font-bold text-neutral-100">{pendingRestoreData.salesCount}</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Purchases:</span>
                  <span className="font-bold text-neutral-100">{pendingRestoreData.purchasesCount}</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Customers:</span>
                  <span className="font-bold text-neutral-100">{pendingRestoreData.customersCount}</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Suppliers:</span>
                  <span className="font-bold text-neutral-100">{pendingRestoreData.suppliersCount}</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Expenses:</span>
                  <span className="font-bold text-neutral-100">{pendingRestoreData.expensesCount}</span>
                </div>
              </div>

              {pendingRestoreData.exportedAt && (
                <div className="text-[10px] text-neutral-500 pt-1">
                  Snapshot created: {new Date(pendingRestoreData.exportedAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] flex items-center gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Restoring will overwrite existing catalog and ledger tables with the data from this backup file.</span>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingRestoreData(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold shadow-lg cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm &amp; Restore Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
