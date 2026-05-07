const path = require('path');
const fs = require('fs');

const FOLDER_IDS = {
  movie: '12Syy28-nBlUd5Qxc-3bESiD-L9R3y_gT',
  reels: '1hcj3cqng0hKuytACJeP3eZB9tztSPcFL',
  photo: '1DvVjFqkTxxipvIr8mvKJAVDb_HxITFSI',
  chat: '1RYXsnpKABhcYEuXL-Zy2UN-CzGwK3UbM',
  intro: '1hho4YNj-W2WSM7hX2rNhjeu1lFlJf7JO',
};

let drive = null;

function getDrive() {
  if (!drive) {
    const { google } = require('googleapis');
    let credentials;
    const envKey = process.env.GOOGLE_SERVICE_ACCOUNT;
    if (envKey) {
      try {
        credentials = typeof envKey === 'string' ? JSON.parse(envKey) : envKey;
      } catch (e) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT env var:', e.message);
        throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT environment variable');
      }
    } else {
      const keyPath = path.join(__dirname, '..', 'service-account.json');
      if (!fs.existsSync(keyPath)) {
        throw new Error('Google Drive credentials not found. Set GOOGLE_SERVICE_ACCOUNT env var or place service-account.json in backend/');
      }
      const keyFile = fs.readFileSync(keyPath, 'utf8');
      credentials = JSON.parse(keyFile);
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    drive = google.drive({ version: 'v3', auth });
  }
  return drive;
}

function getFolderId(subType) {
  const type = (subType || 'movie').toLowerCase();
  if (type === 'reel' || type === 'gossip' || type === 'reels') return FOLDER_IDS.reels;
  if (type === 'photo' || type === 'photos') return FOLDER_IDS.photo;
  if (type === 'chat') return FOLDER_IDS.chat;
  if (type === 'intro') return FOLDER_IDS.intro;
  return FOLDER_IDS.movie;
}

async function uploadFile(filePath, fileName, mimeType, subType, metadata = {}) {
  const driveClient = getDrive();
  const folderId = getFolderId(subType);

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
    properties: metadata,
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await driveClient.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, name, mimeType, size, webContentLink, webViewLink',
  });

  return response.data;
}

async function getFileInfo(fileId) {
  const driveClient = getDrive();
  const response = await driveClient.files.get({
    fileId,
    fields: 'id, name, mimeType, size, webContentLink, webViewLink',
  });
  return response.data;
}

async function getFileStream(fileId, range = null) {
  const driveClient = getDrive();
  const response = await driveClient.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  if (range) {
    const headResponse = await driveClient.files.get({
      fileId,
      fields: 'size',
    });
    const fileSize = parseInt(headResponse.data.size);
    const [start, end] = range.replace('bytes=', '').split('-').map(Number);
    return {
      stream: response.data,
      fileSize,
      start,
      end: end || fileSize - 1,
    };
  }

  return { stream: response.data };
}

async function deleteFile(fileId) {
  const driveClient = getDrive();
  await driveClient.files.delete({ fileId });
}

async function getPublicUrl(fileId) {
  return `https://drive.google.com/uc?id=${fileId}&export=download`;
}

module.exports = {
  getDrive,
  getFolderId,
  uploadFile,
  getFileInfo,
  getFileStream,
  deleteFile,
  getPublicUrl,
  FOLDER_IDS,
};
