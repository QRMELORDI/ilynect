import { API_BASE_URL, ENDPOINTS } from '../apiConfig';
import { io } from 'socket.io-client';

export const getAPIBaseURL = () => API_BASE_URL;

// Wake up backend (Render free tier sleeps after 15 mins)
export const wakeUpBackend = async (retries = 3) => {
  console.log('Waking up backend...');
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_BASE_URL}/health`, { 
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        console.log('Backend is awake!');
        return true;
      }
    } catch (e) {
      console.log(`Wake-up attempt ${i + 1} failed:`, e.message);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  console.warn('Backend wake-up failed after all retries');
  return false;
};

let socket = null;
let chatCallback = null;

export const startChatPoll = (callback) => {
  chatCallback = callback;
  
  if (!socket) {
    const socketUrl = API_BASE_URL.replace('/api', '');
    console.log('Connecting to Socket.io:', socketUrl);
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token: localStorage.getItem('ilynect_token') },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('new-message', (message) => {
      console.log('New message received:', message);
      if (chatCallback) {
        fetchMessages().then(messages => chatCallback(messages));
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
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

export const fetchWithAuth = async (url, options = {}) => {
  // Wake up backend before EVERY request
  await wakeUpBackend();
  
  const token = localStorage.getItem('ilynect_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};

export const fetchMessages = async () => {
  try {
    const messages = await fetchWithAuth(ENDPOINTS.CHATS);
    return (messages || []).map(m => ({
      ...m,
      createdAt: { toDate: () => new Date(m.created_at * 1000) },
    }));
  } catch (err) {
    console.error('Fetch messages error:', err);
    return [];
  }
};

export const sendMessage = async (userId, userName, text) => {
  if (!text.trim()) throw new Error('Message cannot be empty');
  
  try {
    // Use Socket.io for real-time if connected
    if (socket && socket.connected) {
      socket.emit('send-message', { userId, userName, text });
      return { success: true };
    }
    
    // Fallback to REST API
    return await fetchWithAuth(ENDPOINTS.CHATS, {
      method: 'POST',
      body: JSON.stringify({ userId, userName, text }),
    });
  } catch (err) {
    console.error('Send message error:', err);
    throw err;
  }
};

export const voteMessage = async (msgId, userId, type) => {
  try {
    return await fetchWithAuth(`${ENDPOINTS.VIDEOS}/${msgId}/interact`, {
      method: 'POST',
      body: JSON.stringify({ userId, type: type === 'up' ? 'like' : 'dislike' }),
    });
  } catch (err) {
    console.error('Vote error:', err);
    throw err;
  }
};

export const getVideos = async (params = {}) => {
  try {
    const qp = new URLSearchParams();
    if (params.type) qp.set('sub_type', params.type);
    if (params.sub_type) qp.set('sub_type', params.sub_type);
    if (params.category && params.category !== 'All') qp.set('category', params.category);
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
  } catch (err) {
    console.error('Get videos error:', err);
    return [];
  }
};

export const getPhotos = async () => {
  try {
    const data = await fetchWithAuth(ENDPOINTS.PHOTOS);
    return (data.photos || []).map(p => ({
      ...p,
      createdAt: p.created_at ? { toDate: () => new Date(p.created_at * 1000) } : new Date(),
      photoUrl: ENDPOINTS.PHOTO(p.id),
      downloadUrl: ENDPOINTS.DOWNLOAD('photo', p.id),
    }));
  } catch (err) {
    console.error('Get photos error:', err);
    return [];
  }
};

export const uploadVideo = async (uploadData, onProgress) => {
  try {
    const formData = new FormData();
    const file = uploadData.file || uploadData.get?.('video') || uploadData.get?.('photos');
    const title = uploadData.title || uploadData.get?.('title') || '';
    const category = uploadData.category || uploadData.get?.('category') || 'General';
    const sub_type = uploadData.sub_type || uploadData.get?.('sub_type') || 'movie';
    const userId = uploadData.userId || uploadData.get?.('userId') || '';
    const userName = uploadData.userName || uploadData.get?.('userName') || 'Anonymous';
    
    formData.append('video', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('sub_type', sub_type);
    formData.append('userId', userId);
    formData.append('userName', userName);
    
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
          if (onProgress) onProgress(100);
          resolve(result.video || result);
        } else {
          const err = JSON.parse(xhr.response || '{}');
          reject(new Error(err.error || 'Upload failed'));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
};

export const uploadPhotos = uploadVideo;

export const recordDownload = async (id, userId, userName, type = 'video') => {
  try {
    return await fetchWithAuth(`${ENDPOINTS.VIDEOS}/${id}/download`, {
      method: 'POST',
      body: JSON.stringify({ userId, userName }),
    });
  } catch (err) {
    console.error('Record download error:', err);
  }
};

export const recordView = async (id, userId, userName) => {
  try {
    return await fetchWithAuth(`${ENDPOINTS.VIDEOS}/${id}/view`, {
      method: 'POST',
      body: JSON.stringify({ userId, userName }),
    });
  } catch (err) {
    console.error('Record view error:', err);
  }
};

export const getHistory = async (userId) => {
  try {
    const rows = await fetchWithAuth(ENDPOINTS.HISTORY(userId));
    return (rows || []).map(r => ({
      id: r.id,
      action: r.action,
      content_title: r.content_title,
      created_at: r.created_at,
    }));
  } catch (err) {
    console.error('Get history error:', err);
    return [];
  }
};

export const getDailyContent = async (category) => {
  try {
    const data = await fetchWithAuth(ENDPOINTS.DAILY);
    const today = new Date().toISOString().split('T')[0];
    
    if (category) {
      const content = data[category];
      if (category === 'health' && data.health_tips) return data.health_tips;
      if (typeof content === 'string') return [content];
      if (Array.isArray(content)) return content;
      return [content];
    }
    return data;
  } catch (err) {
    console.error('Daily content error:', err);
    return getFallbackContent();
  }
};

function getFallbackContent() {
  return {
    date: new Date().toISOString().split('T')[0],
    education: { fact: 'Science: Honey never spoils.' },
    brain_twister: 'What has keys but cant open locks? (Piano)',
    gk: 'Who wrote Indian National Anthem? Rabindranath Tagore.',
    neethivaakyam: 'సత్యమే వేద ధర్మం పరమాణం.',
    speciality: 'Today is a new opportunity!',
    maths_puzzle: 'Odd number, remove one letter = even. (Seven)',
    thought: 'Courage to continue is success.',
    joke: 'జోక్: ఒకసారి నాన్నని: నాన్న పుట్టి ఎందుకు? నాన్న: ఆకాశంలో నక్షత్రాలు కాంతి కోసం.',
    science: 'A day on Venus is longer than its year.'
  };
}

export const askAI = async (prompt, type) => {
  try {
    return await fetchWithAuth(ENDPOINTS.AI_ASK, {
      method: 'POST',
      body: JSON.stringify({ prompt, type }),
    });
  } catch (err) {
    console.error('AI ask error:', err);
    throw err;
  }
};

export const checkVersion = async () => {
  try {
    return await fetchWithAuth(ENDPOINTS.VERSION);
  } catch (err) {
    console.error('Version check error:', err);
    return { version: '1.0.5', update_required: false };
  }
};

export const setUserOnline = async (userId, userName) => {
  if (!userId) return;
  try {
    await fetchWithAuth(ENDPOINTS.PRESENCE, {
      method: 'POST',
      body: JSON.stringify({ userId, userName }),
    });
  } catch (err) {
    console.error('Presence error:', err);
  }
};

export const getOnlineUsers = (callback) => {
  const fetchOnline = async () => {
    try {
      const users = await fetchWithAuth(ENDPOINTS.ONLINE_USERS);
      callback(users || []);
    } catch (err) {
      console.error('Online users error:', err);
      callback([]);
    }
  };
  
  fetchOnline();
  const interval = setInterval(fetchOnline, 15000);
  return () => clearInterval(interval);
};

export const loginUser = async (email, name) => {
  try {
    const data = await fetchWithAuth(ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
    if (data.token) localStorage.setItem('ilynect_token', data.token);
    return data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};

export const updateUserName = async (userId, name) => {
  try {
    const data = await fetchWithAuth(ENDPOINTS.AUTH_UPDATE_NAME, {
      method: 'PATCH',
      body: JSON.stringify({ userId, name }),
    });
    if (data.token) localStorage.setItem('ilynect_token', data.token);
    return data;
  } catch (err) {
    console.error('Update name error:', err);
    throw err;
  }
};
