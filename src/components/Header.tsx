import React from 'react';
import { Shield, Lock, Globe, UserCheck, Smartphone, Cloud, RotateCcw, Settings } from 'lucide-react';
import { AppSettings, Owner } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';

interface Props {
  settings: AppSettings;
  owners: Owner[];
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onLockApp: () => void;
  onOpenAndroidStudio: () => void;
  onOpenCloudSync: () => void;
  onOpenSettings?: () => void;
  onRestartApp?: () => void;
}

export const Header: React.FC<Props> = ({
  settings,
  owners,
  onUpdateSettings,
  onLockApp,
  onOpenAndroidStudio,
  onOpenCloudSync,
  onOpenSettings,
  onRestartApp,
}) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  return (
    <header className={`sticky top-0 z-40 border-b ${currentTheme.cardBorder} ${currentTheme.cardBg} no-print`}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <span className="font-brand font-extrabold text-amber-400 text-xl tracking-wider">S</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand font-bold text-lg sm:text-xl tracking-wide text-amber-400">
                {t.appName}
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                PKR
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium hidden sm:block">
              {t.tagline} · <span className="text-amber-200/70">Saqib · Adil · Javaid</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Active Partner Switcher */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-700/60 bg-neutral-900/60 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={settings.currentOwner}
              onChange={(e) => onUpdateSettings({ currentOwner: e.target.value as any })}
              className="bg-transparent text-neutral-200 font-medium text-xs focus:outline-none cursor-pointer"
              title="Active Partner"
            >
              {owners.map((owner) => (
                <option key={owner.id} value={owner.name} className="bg-neutral-900 text-neutral-200">
                  {owner.name} ({owner.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-700/60 bg-neutral-900/60 text-xs">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value as any })}
              className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer font-medium"
              title="Select Language"
            >
              <option value="en" className="bg-neutral-900 text-neutral-200">English</option>
              <option value="ur" className="bg-neutral-900 text-neutral-200">اردو (Urdu)</option>
              <option value="roman_ur" className="bg-neutral-900 text-neutral-200">Roman Urdu</option>
            </select>
          </div>

          {/* Cloud Sync Shortcut */}
          <button
            onClick={onOpenCloudSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors text-xs font-semibold cursor-pointer"
            title="Cloud Sync (Google Drive & Private Server)"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Cloud Sync</span>
          </button>

          {/* Android APK Shortcut */}
          <button
            onClick={onOpenAndroidStudio}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 transition-colors text-xs font-semibold"
            title="Download Android Studio Project & APK Guide"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android APK</span>
          </button>

          {/* Restart / Erase Data Button */}
          {onRestartApp && (
            <button
              onClick={onRestartApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 transition-colors text-xs font-semibold cursor-pointer"
              title="Restart App & Erase All Data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden lg:inline text-[11px]">Restart</span>
            </button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800/80 transition-colors border border-transparent hover:border-neutral-700 cursor-pointer"
              title="Settings & System Preferences"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Lock App Button */}
          {settings.security.pinEnabled && (
            <button
              onClick={onLockApp}
              className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800/80 transition-colors border border-transparent hover:border-neutral-700 cursor-pointer"
              title="Lock Screen (Security PIN)"
            >
              <Lock className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
