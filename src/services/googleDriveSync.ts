export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  description?: string;
}

const DRIVE_FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/**
 * List existing database backups stored in user's Google Drive.
 */
export async function listDriveBackups(accessToken: string): Promise<DriveBackupFile[]> {
  const query = encodeURIComponent("name contains 'SAQIB_Belt_Business_Backup' and trashed = false");
  const fields = encodeURIComponent('files(id, name, createdTime, modifiedTime, size, description)');
  const url = `${DRIVE_FILES_ENDPOINT}?q=${query}&fields=${fields}&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list Google Drive backups (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Upload an encrypted/formatted SQLite JSON database backup to Google Drive.
 */
export async function uploadDriveBackup(
  accessToken: string,
  backupContent: string,
  fileName?: string
): Promise<DriveBackupFile> {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const name = fileName || `SAQIB_Belt_Business_Backup_${dateStr}.json`;

  const parsed = JSON.parse(backupContent);
  const desc = `SAQIB Belt Business Database · Products: ${parsed.products?.length || 0}, Sales: ${parsed.sales?.length || 0}, Purchases: ${parsed.purchases?.length || 0}`;

  const metadata = {
    name,
    mimeType: 'application/json',
    description: desc,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    backupContent +
    closeDelimiter;

  const res = await fetch(DRIVE_UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload backup to Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Download database backup content from Google Drive by file ID.
 */
export async function downloadDriveBackup(accessToken: string, fileId: string): Promise<string> {
  const url = `${DRIVE_FILES_ENDPOINT}/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to download backup from Google Drive (${res.status})`);
  }

  return await res.text();
}

/**
 * Permanently delete a backup file from Google Drive.
 */
export async function deleteDriveBackup(accessToken: string, fileId: string): Promise<void> {
  const url = `${DRIVE_FILES_ENDPOINT}/${fileId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file from Google Drive (${res.status})`);
  }
}
