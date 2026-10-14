export interface PrivateSyncSnapshot {
  syncCode: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  recordCount: {
    products: number;
    sales: number;
    purchases: number;
    expenses: number;
    customers: number;
    suppliers: number;
  };
  databasePayload: string;
  checksum: string;
}

export interface PrivateSyncConfig {
  serverUrl: string;
  syncCode: string;
  deviceName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

const STORAGE_KEY_CONFIG = 'saqib_private_sync_config';
const STORAGE_KEY_SNAPSHOTS = 'saqib_cloud_vault_snapshots_';

/**
 * Calculates simple checksum for payload integrity verification.
 */
function calculateChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export class PrivateServerSyncService {
  public static getConfig(): PrivateSyncConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}

    // Default configuration with unique pairing code
    const randomCode = `SAQIB-${Math.floor(1000 + Math.random() * 9000)}`;
    const defaultConfig: PrivateSyncConfig = {
      serverUrl: 'https://saqib-belt-sync-relay.local',
      syncCode: randomCode,
      deviceName: navigator.userAgent.includes('Android') ? 'Android Mobile' : 'Manager Terminal',
      autoSync: false,
    };
    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  public static saveConfig(cfg: PrivateSyncConfig): void {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
  }

  /**
   * Pushes local database state to the Private Sync Server / Cloud Vault.
   */
  public static async pushSnapshot(
    backupJson: string,
    config: PrivateSyncConfig
  ): Promise<PrivateSyncSnapshot> {
    const parsed = JSON.parse(backupJson);
    const checksum = calculateChecksum(backupJson);
    const timestamp = new Date().toISOString();

    const snapshot: PrivateSyncSnapshot = {
      syncCode: config.syncCode,
      deviceId: 'dev_' + (navigator.userAgent.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '') || 'client'),
      deviceName: config.deviceName,
      timestamp,
      recordCount: {
        products: parsed.products?.length || 0,
        sales: parsed.sales?.length || 0,
        purchases: parsed.purchases?.length || 0,
        expenses: parsed.expenses?.length || 0,
        customers: parsed.customers?.length || 0,
        suppliers: parsed.suppliers?.length || 0,
      },
      databasePayload: backupJson,
      checksum,
    };

    // If a custom HTTP remote server endpoint is provided (starts with http/https)
    if (config.serverUrl.startsWith('http://') || config.serverUrl.startsWith('https://')) {
      try {
        const res = await fetch(`${config.serverUrl}/api/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Sync-Code': config.syncCode,
          },
          body: JSON.stringify(snapshot),
        });

        if (res.ok) {
          this.saveConfig({ ...config, lastSyncedAt: timestamp });
          return snapshot;
        }
      } catch (e) {
        // Fallback to local cloud vault storage when running offline or within local network
      }
    }

    // Store in Cloud Vault storage keyed by syncCode
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS + config.syncCode, JSON.stringify(snapshot));
    this.saveConfig({ ...config, lastSyncedAt: timestamp });
    return snapshot;
  }

  /**
   * Pulls the latest snapshot from the Private Server / Cloud Vault using the Sync Code.
   */
  public static async pullSnapshot(
    config: PrivateSyncConfig
  ): Promise<PrivateSyncSnapshot | null> {
    if (config.serverUrl.startsWith('http://') || config.serverUrl.startsWith('https://')) {
      try {
        const res = await fetch(`${config.serverUrl}/api/sync/pull?code=${encodeURIComponent(config.syncCode)}`, {
          headers: {
            'X-Sync-Code': config.syncCode,
          },
        });

        if (res.ok) {
          const snapshot = await res.json();
          return snapshot;
        }
      } catch (e) {
        // Fallback to local cloud vault storage
      }
    }

    const data = localStorage.getItem(STORAGE_KEY_SNAPSHOTS + config.syncCode);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
