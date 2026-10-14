/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './db/database';
import { AppSettings, Owner, SaleItem, ThemeId } from './types';
import { themes, resolveTheme } from './theme/themes';
import { WallpaperContainer } from './components/WallpaperContainer';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { PosSalesView } from './components/PosSalesView';
import { ProductsView } from './components/ProductsView';
import { PurchasesView } from './components/PurchasesView';
import { StockView } from './components/StockView';
import { ProfitLossView } from './components/ProfitLossView';
import { LedgersView } from './components/LedgersView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { OwnersView } from './components/OwnersView';
import { SettingsView } from './components/SettingsView';
import { AndroidStudioProjectView } from './components/AndroidStudioProjectView';
import { CloudSyncView } from './components/CloudSyncView';
import { InvoiceModal } from './components/InvoiceModal';
import { PinLockModal } from './components/PinLockModal';
import { AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { translations } from './i18n/translations';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => db.getSettings());
  const [owners, setOwners] = useState<Owner[]>(() => db.getOwners());
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [previousTab, setPreviousTab] = useState<TabId>('dashboard');
  const [activeInvoice, setActiveInvoice] = useState<SaleItem | null>(null);
  const [targetPurchaseProductId, setTargetPurchaseProductId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(() => db.getSettings().security.pinEnabled);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [restartToast, setRestartToast] = useState<string | null>(null);

  const handleNavigateTab = (tab: TabId) => {
    if (tab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(tab);
    }
  };

  // Sync RTL and document language
  useEffect(() => {
    document.documentElement.lang = settings.language;
    if (settings.language === 'ur') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [settings.language]);

  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    const updated = db.updateSettings(updates);
    setSettings(updated);
  };

  const handleRefreshAll = () => {
    setSettings(db.getSettings());
    setOwners(db.getOwners());
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLockApp = () => {
    setIsLocked(true);
  };

  const handleUnlockApp = () => {
    setIsLocked(false);
  };

  // Listen to system theme updates
  useEffect(() => {
    if (settings.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const listener = () => setRefreshTrigger((prev) => prev + 1);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  const currentTheme = resolveTheme(settings.theme);
  const dashboardStats = db.getDashboardStats();

  return (
    <div
      className={`min-h-screen ${currentTheme.appBg} ${currentTheme.textPrimary} transition-colors duration-200 ${
        settings.language === 'ur' ? 'font-urdu' : 'font-sans'
      }`}
    >
      {/* PIN Security Gate Overlay */}
      {isLocked && settings.security.pinEnabled && (
        <PinLockModal security={settings.security} onUnlock={handleUnlockApp} />
      )}

      {/* Main Wallpaper Container Wrapper */}
      <WallpaperContainer wallpaper={settings.wallpaper}>
        {/* App Header */}
        <Header
          settings={settings}
          owners={owners}
          onUpdateSettings={handleUpdateSettings}
          onLockApp={handleLockApp}
          onOpenAndroidStudio={() => handleNavigateTab('android_studio')}
          onOpenCloudSync={() => handleNavigateTab('cloud_sync')}
          onOpenSettings={() => handleNavigateTab('settings')}
          onRestartApp={() => setIsRestartConfirmOpen(true)}
        />

        {/* Tab Navigation */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          settings={settings}
          lowStockCount={dashboardStats.lowStockAlertsCount}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 flex-1 w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              key={refreshTrigger}
              settings={settings}
              onNavigate={(tab) => {
                setTargetPurchaseProductId(null);
                setActiveTab(tab);
              }}
              onViewInvoice={(sale) => setActiveInvoice(sale)}
              onCreatePurchaseOrder={(productId) => {
                setTargetPurchaseProductId(productId);
                setActiveTab('purchases');
              }}
            />
          )}

          {activeTab === 'sales' && (
            <PosSalesView
              key={refreshTrigger}
              settings={settings}
              onRefresh={handleRefreshAll}
              onOpenInvoice={(sale) => setActiveInvoice(sale)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              key={refreshTrigger}
              settings={settings}
              onRefresh={handleRefreshAll}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView
              key={`${refreshTrigger}_${targetPurchaseProductId}`}
              settings={settings}
              preselectedProductId={targetPurchaseProductId}
              onRefresh={handleRefreshAll}
            />
          )}

          {activeTab === 'stock' && (
            <StockView
              key={refreshTrigger}
              settings={settings}
              onRefresh={handleRefreshAll}
            />
          )}

          {activeTab === 'profit_loss' && (
            <ProfitLossView
              key={refreshTrigger}
              settings={settings}
            />
          )}

          {activeTab === 'ledgers' && (
            <LedgersView
              key={refreshTrigger}
              settings={settings}
              onRefresh={handleRefreshAll}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              key={refreshTrigger}
              settings={settings}
              onRefresh={handleRefreshAll}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              key={refreshTrigger}
              settings={settings}
            />
          )}

          {activeTab === 'owners' && (
            <OwnersView
              settings={settings}
              owners={owners}
              onSelectOwner={(name) => handleUpdateSettings({ currentOwner: name })}
            />
          )}

          {activeTab === 'cloud_sync' && (
            <CloudSyncView
              settings={settings}
              onRefreshAll={handleRefreshAll}
            />
          )}

          {activeTab === 'android_studio' && (
            <AndroidStudioProjectView settings={settings} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRefreshAll={handleRefreshAll}
              onNavigate={handleNavigateTab}
              onBack={() => handleNavigateTab(previousTab || 'dashboard')}
              previousTab={previousTab}
              onLockApp={handleLockApp}
            />
          )}
        </main>

        {/* Global Printable Sales Invoice Modal */}
        {activeInvoice && (
          <InvoiceModal
            sale={activeInvoice}
            settings={settings}
            onClose={() => setActiveInvoice(null)}
          />
        )}

        {/* Global Restart & Erase All Data Modal */}
        {isRestartConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
            <div className="w-full max-w-md bg-neutral-900 border border-red-500/60 rounded-2xl p-6 space-y-4 text-xs shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-950 border border-red-500/50 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-base text-neutral-100">
                    {translations[settings.language].restartConfirmTitle}
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
                  Your settings (language, theme, wallpaper, PIN) will remain intact. You will be able to start entering your real belts from a completely clean slate.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRestartConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-semibold cursor-pointer"
                >
                  {translations[settings.language].cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    db.eraseAllData();
                    setIsRestartConfirmOpen(false);
                    handleRefreshAll();
                    setRestartToast(translations[settings.language].restartSuccess);
                    setTimeout(() => setRestartToast(null), 6000);
                  }}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-lg cursor-pointer active:scale-95"
                >
                  Yes, Erase All Data &amp; Restart Fresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {restartToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2.5 shadow-2xl animate-fade-in no-print">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{restartToast}</span>
            <button onClick={() => setRestartToast(null)} className="ml-2 text-neutral-400 hover:text-white">✕</button>
          </div>
        )}
      </WallpaperContainer>
    </div>
  );
}
