import { API_BASE_URL, ENDPOINTS } from '../apiConfig';
import { io } from 'socket.io-client';

// Wake up backend (Render free tier sleeps after 15 mins)
export const wakeUpBackend = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return true;
    } catch (e) {
      console.log(`Wake-up attempt ${i + 1} failed, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return false;
};

export const getAPIBaseURL = () => API_BASE_URL;

let socket = null;
let chatCallback = null;

export const startChatPoll = (callback) => {
  chatCallback = callback;
  
  if (!socket) {
    const socketUrl = API_BASE_URL.replace('/api', '');
    socket = io(socketUrl, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('ilynect_token') }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('new-message', (message) => {
      if (chatCallback) {
        fetchMessages().then(messages => chatCallback(messages));
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  fetchMessages().then(messages => callback(messages));
};

export const stopChatPoll = () => {
  chatCallback = null;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const wakeUpServer = async () => {
  try {
    const data = await fetchWithAuth(`${API_BASE_URL}/wakeup`, { timeout: 15000 });
    return data.success;
  } catch (err) {
    console.warn('Wakeup attempt failed, retrying...', err.message);
    return false;
  }
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('ilynect_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const controller = new AbortController();
  const timeoutMs = options.timeout || 60000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Server is taking too long to respond. Render is likely waking up. Please wait 20 seconds and try again.');
    }
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Check your internet or wait for the server to wake up.');
    }
    throw err;
  }
};

// AUTH
export const loginUser = async (email, name) => {
  const data = await fetchWithAuth(ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
  if (data.token) localStorage.setItem('ilynect_token', data.token);
  return data;
};

export const updateUserName = async (userId, name) => {
  const data = await fetchWithAuth(ENDPOINTS.AUTH_UPDATE_NAME, {
    method: 'PATCH',
    body: JSON.stringify({ userId, name }),
  });
  if (data.token) localStorage.setItem('ilynect_token', data.token);
  return data;
};

// MESSAGES
export const fetchMessages = async () => {
  const messages = await fetchWithAuth(ENDPOINTS.CHATS);
  return (messages || []).map(m => ({
    ...m,
    createdAt: { toDate: () => new Date(m.created_at * 1000) },
  }));
};

export const sendMessage = async (userId, userName, text) => {
  return fetchWithAuth(ENDPOINTS.CHATS, {
    method: 'POST',
    body: JSON.stringify({ userId, userName, text }),
  });
};

export const voteMessage = async (msgId, userId, type) => {
  try {
    const data = await fetchWithAuth(`${ENDPOINTS.VIDEOS}/${msgId}/interact`, {
      method: 'POST',
      body: JSON.stringify({ userId, type: type === 'up' ? 'like' : 'dislike' }),
    });
    return data;
  } catch {
    return null;
  }
};

// VIDEOS
export const getVideos = async (params = {}) => {
  const qp = new URLSearchParams();
  if (params.type) qp.set('sub_type', params.sub_type || params.type);
  if (params.category && params.category !== 'All') qp.set('category', params.category);
  if (params.sub_type) qp.set('sub_type', params.sub_type);
  if (params.search) qp.set('search', params.search);
  const data = await fetchWithAuth(`${ENDPOINTS.VIDEOS}?${qp.toString()}`);
  const rawVideos = data.videos || [];
  return rawVideos.map(v => ({
    ...v,
    id: v.id,
    createdAt: v.created_at ? { toDate: () => new Date(v.created_at * 1000) } : new Date(),
    streamUrl: ENDPOINTS.STREAM('video', v.id),
    downloadUrl: ENDPOINTS.DOWNLOAD('video', v.id),
    photoUrl: v.sub_type === 'photo' ? ENDPOINTS.PHOTO(v.id) : null,
  }));
};

export const uploadVideo = async (uploadData, onProgress) => {
  const formData = new FormData();
  const file = uploadData.file || uploadData.get?.('video') || uploadData.get?.('photos');
  const title = uploadData.title || uploadData.get?.('title') || '';
  const category = uploadData.category || uploadData.get?.('category') || 'General';
  const sub_type = uploadData.sub_type || uploadData.get?.('sub_type') || 'movie';
  const userId = uploadData.userId || uploadData.get?.('userId') || '';
  const userName = uploadData.userName || uploadData.get?.('userName') || 'Anonymous';
  const thumbnail = uploadData.thumbnail || uploadData.get?.('thumbnail') || '';
  const description = uploadData.description || '';
  const duration_sec = uploadData.duration_sec || 0;

  formData.append('video', file);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('sub_type', sub_type);
  formData.append('userId', userId);
  formData.append('userName', userName);
  formData.append('thumbnail', thumbnail);
  formData.append('duration_sec', duration_sec);

  if (onProgress) onProgress(10);

  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('ilynect_token');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', ENDPOINTS.VIDEOS + '/upload');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.response);
        resolve(result.video || result);
      } else {
        reject(new Error(xhr.response?.error || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error. Check internet connection.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Render server may be sleeping - wait 30s and try again.'));
    xhr.timeout = 120000;
    xhr.send(formData);
  });
};

export const uploadPhotos = async (uploadData, onProgress) => {
  const formData = new FormData();
  const files = uploadData.files || (uploadData.file ? [uploadData.file] : []);
  const title = uploadData.title || '';
  const userId = uploadData.userId || '';
  const userName = uploadData.userName || 'Anonymous';

  files.forEach(f => formData.append('photos', f));
  formData.append('title', title);
  formData.append('userId', userId);
  formData.append('userName', userName);

  if (onProgress) onProgress(10);

  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('ilynect_token');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', ENDPOINTS.PHOTOS + '/upload');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.response);
        resolve(result.photos || result);
      } else {
        let errMsg = 'Upload failed';
        try { errMsg = JSON.parse(xhr.response).error || errMsg; } catch {}
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error. Check internet connection.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Render server may be sleeping - wait 30s and try again.'));
    xhr.timeout = 120000;
    xhr.send(formData);
  });
};

export const deleteVideo = async (id) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${id}`, { method: 'DELETE' });
};

export const deletePhoto = async (id) => {
  return fetchWithAuth(`${ENDPOINTS.PHOTOS}/${id}`, { method: 'DELETE' });
};

export const updateVideo = async (id, data) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const recordView = async (id, userId, userName) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${id}/view`, {
    method: 'POST',
    body: JSON.stringify({ userId, userName }),
  });
};

export const recordDownload = async (id, userId, userName) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${id}/download`, {
    method: 'POST',
    body: JSON.stringify({ userId, userName }),
  });
};

export const recordVideoDownload = recordDownload;

export const recordPhotoDownload = async (id) => {
  return fetchWithAuth(`${ENDPOINTS.PHOTOS}/${id}/download`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const interactVideo = async (videoId, userId, type) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${videoId}/interact`, {
    method: 'POST',
    body: JSON.stringify({ userId, type }),
  });
};

// COMMENTS
export const getComments = async (videoId) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${videoId}/comments`);
};

export const addComment = async (videoId, userId, userName, text) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${videoId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ userId, userName, text }),
  });
};

// WATCH POSITION
export const saveWatchPosition = async (videoId, userId, positionSec) => {
  return fetchWithAuth(`${ENDPOINTS.VIDEOS}/${videoId}/watch-position`, {
    method: 'POST',
    body: JSON.stringify({ userId, positionSec }),
  });
};

export const getWatchPosition = async (videoId, userId) => {
  try {
    const data = await fetchWithAuth(`${ENDPOINTS.VIDEOS}/${videoId}/watch-position?userId=${userId}`);
    return data.positionSec || 0;
  } catch {
    return 0;
  }
};

// PHOTOS
export const getPhotos = async () => {
  const data = await fetchWithAuth(ENDPOINTS.PHOTOS);
  return (data.photos || []).map(p => ({
    ...p,
    createdAt: p.created_at ? { toDate: () => new Date(p.created_at * 1000) } : new Date(),
    photoUrl: ENDPOINTS.PHOTO(p.id),
    downloadUrl: ENDPOINTS.DOWNLOAD('photo', p.id),
  }));
};

export const getPhotoUrl = (id) => ENDPOINTS.PHOTO(id);
export const getVideoUrl = (id) => ENDPOINTS.STREAM('video', id);

// HISTORY
export const getHistory = async (userId) => {
  try {
    const rows = await fetchWithAuth(ENDPOINTS.HISTORY(userId));
    return (rows || []).map(r => ({
      id: r.id,
      action: r.action,
      content_title: r.content_title,
      created_at: r.created_at,
    }));
  } catch {
    return [];
  }
};

// DAILY CONTENT
const dailyCache = {};

export const getDailyContent = async (category) => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `ily_daily_${today}`;

  let content = dailyCache[cacheKey];
  if (!content) {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) content = JSON.parse(cachedStr);
    } catch {}
  }

  if (!content) {
    try {
      const data = await fetchWithAuth(ENDPOINTS.DAILY);
      content = {
        date: today,
        fact: data.fact || '',
        quiz: data.quiz || '',
        gk: data.gk || '',
        manchi_maata: data.manchi_maata || '',
        speciality: data.speciality || '',
        joke: data.joke || '',
        idiom: data.idiom || '',
        brain_puzzle: data.brain_puzzle || '',
        math_puzzle: data.math_puzzle || '',
        health_tips: data.tips || data.health_tips || [],
        education: { fact: data.fact },
        health: { fact: data.health_tip },
      };
      dailyCache[cacheKey] = content;
      localStorage.setItem(cacheKey, JSON.stringify(content));
    } catch (err) {
      console.error('Daily Content Error:', err);
      content = getFallbackContent(today);
    }
  }

  if (category) {
    const data = content[category];
    if (category === 'health' && content.health_tips) return content.health_tips;
    if (data && data.fact) return [data.fact];
    if (typeof data === 'string') return [data];
    return Array.isArray(data) ? data : (data ? [data] : []);
  }
  return content;
};

function getFallbackContent(today) {
  return {
    date: today,
    education: { fact: 'Science Fact: Honey never spoils.' },
    health: { fact: 'Health Tip: Drink water before meals.' },
    health_tips: [
      'ప్రతిరోజూ కనీసం 8 గ్లాసుల నీరు త్రాగాలి.',
      'రోజూ 30 నిమిషాల నడక ఆరోగ్యానికి చాలా మంచిది.',
      'రాత్రిపూట 7-8 గంటల నిద్ర తప్పనిసరి.',
      'పండ్లు మరియు ఆకుకూరలు ఎక్కువగా తీసుకోవాలి.',
      'ఒత్తిడిని తగ్గించుకోవడానికి యోగా లేదా ధ్యానం చేయండి.'
    ],
    gk: 'General Knowledge: Who is the father of Indian Constitution? Dr. B.R. Ambedkar.',
    neethivaakyam: 'నీతివాక్యం: నిజాన్ని చెప్పేవాడు ఎప్పుడూ భయపడాల్సిన అవసరం లేదు.',
    speciality: 'Daily Speciality: Today is a new opportunity to learn and grow!',
    maths_puzzle: 'Maths Puzzle: I am an odd number. Take away one letter and I become even. (Answer: Seven)',
    brain_twister: 'Brain Twister: What has keys but can\'t open locks? A piano.',
    thought: 'Thought: Success is not final, failure is not fatal: it is the courage to continue.',
    joke: 'జోక్: ఒకసారి ఒక అబ్బాయి తన నాన్నతో: నాన్న, ఆకాశం మీద నక్షత్రాలు ఎందుకు ఉంటాయి? నాన్న: అవి రాత్రి పూట చదువుకోవడానికి లైట్లు బాబు!',
    science: 'Science Fact: A day on Venus is longer than a year on Venus.'
  };
}

// PRESENCE
export const setUserOnline = async (userId, userName) => {
  if (!userId) return;
  try {
    await fetchWithAuth(ENDPOINTS.PRESENCE, {
      method: 'POST',
      body: JSON.stringify({ userId, userName }),
    });
  } catch {}
};

export const getOnlineUsers = (callback) => {
  const fetchOnline = async () => {
    try {
      const users = await fetchWithAuth(ENDPOINTS.ONLINE_USERS);
      callback(users || []);
    } catch {
      callback([]);
    }
  };
  fetchOnline();
  const interval = setInterval(fetchOnline, 15000);
  return () => clearInterval(interval);
};

// VERSION
export const checkVersion = async () => {
  try {
    return await fetchWithAuth(ENDPOINTS.VERSION);
  } catch {
    return { version: '2.0.0', update_required: false };
  }
};

// AI
export const askAI = async (prompt, type) => {
  return fetchWithAuth(ENDPOINTS.AI_ASK, {
    method: 'POST',
    body: JSON.stringify({ prompt, type }),
  });
};
