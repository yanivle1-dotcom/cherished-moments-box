// src/integrations/GoogleDrive.ts
// פונקציות סנכרון תיקיית Google Drive ויצירת רשומות אירוע/מדיה

// נדרשים:
// npm install googleapis
// הגדרת Client בגוגל + API Key / OAuth
import { google } from 'googleapis';
import { MediaRecord, EventRecord } from './supabase/types';

// הגדרת CLIENT
const DRIVE_CLIENT = new google.drive({
  version: 'v3',
  auth: 'YOUR_API_KEY' // מומלץ OAUTH2 בשרת
});

// סינכרון תיקייה לפי folderId
export async function syncDriveFolder(eventId: string, folderId: string): Promise<MediaRecord[]> {
  const files = await DRIVE_CLIENT.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, webContentLink, thumbnailLink, createdTime)',
    pageSize: 100
  });
  
  return files.data.files
    .filter((item) => item.mimeType.startsWith('image/') || item.mimeType.startsWith('video/'))
    .map((file) => ({
      event_id: eventId,
      type: file.mimeType.startsWith('image/') ? 'image' : 'video',
      file_url: file.webContentLink,
      thumbnail_url: file.thumbnailLink,
      title: file.name,
      caption: '',
      tags: [],
      source: 'drive',
      created_at: file.createdTime,
      visible: true,
      photographer: '',
    }));
}

// דוגמה לפונקציה יצירת אירוע חדש
export async function createDriveEvent(title: string, date: string, folderId: string): Promise<EventRecord> {
  const folder = await DRIVE_CLIENT.files.get({ fileId: folderId, fields: 'id, name' });
  return {
    id: folderId,
    title,
    date,
    location: '', // ניתן לעדכן
    cover_image_url: '', // עדכון לפי file
    description_short: '',
    description_full: '',
    status: 'Published',
    drive_folder_id: folderId,
    google_photos_album_id: '',
    sheet_range: '',
  };
}

// פונקציה לסנכרון מלא של כל התיקייה ושימור מדיה
export async function fullDriveSync(eventId: string, folderId: string) {
  const mediaItems = await syncDriveFolder(eventId, folderId);
  // צרף פונקציה לשמירה ב-Supabase (insertMediaRecords), או החזרת מערך ל-Supabase/DB
  return mediaItems;
}
