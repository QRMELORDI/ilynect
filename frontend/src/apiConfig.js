const IS_PRODUCTION = import.meta.env.PROD;

const RENDER_API_URL = import.meta.env.VITE_API_URL || "https://ilynect-2.onrender.com/api";
const LOCAL_API_URL = "http://localhost:3001/api";

export const API_BASE_URL = IS_PRODUCTION ? RENDER_API_URL : LOCAL_API_URL;

export const ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_UPDATE_NAME: `${API_BASE_URL}/auth/update-name`,
  AUTH_GET_USER: (id) => `${API_BASE_URL}/auth/user/${id}`,
  VIDEOS: `${API_BASE_URL}/videos`,
  PHOTOS: `${API_BASE_URL}/photos`,
  PRESENCE: `${API_BASE_URL}/presence`,
  ONLINE_USERS: `${API_BASE_URL}/presence/online`,
  HISTORY: (userId) => `${API_BASE_URL}/history/${userId}`,
  VERSION: `${API_BASE_URL}/version`,
  STREAM: (type, id) => `${API_BASE_URL}/files/stream/${type}/${id}`,
  DOWNLOAD: (type, id) => `${API_BASE_URL}/files/download/${type}/${id}`,
  PHOTO: (id) => `${API_BASE_URL}/files/photo/${id}`,
  MOVIERULZ: `${API_BASE_URL}/movierulz`,
};

export default API_BASE_URL;
