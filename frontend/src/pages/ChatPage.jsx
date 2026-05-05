import React, { useState, useEffect, useRef } from 'react';
import { fetchMessages, sendMessage, getOnlineUsers, startChatPoll, stopChatPoll } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const TREES = ['🌳', '🌴', '🌲', '🌵', '🎄', '🎋', '🍀', '🌿', '🌱', '🍃'];
const TREE_COLORS = ['#06D6A0', '#4CC9F0', '#FFD700', '#E53170', '#7B2FFF', '#FF6B6B', '#3D5A80', '#F72585', '#4361EE', '#FF9F1C'];

function getTreeAvatar(name) {
  if (!name) return { tree: TREES[0], color: TREE_COLORS[0] };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return { tree: TREES[Math.abs(hash) % TREES.length], color: TREE_COLORS[Math.abs(hash) % TREE_COLORS.length] };
}

function formatTime(createdAt) {
  if (!createdAt) return '';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(createdAt) {
  if (!createdAt) return 'Unknown';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ChatPage() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const timeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        setLoading(false);
        setError('Loading timed out. Tap refresh to try again.');
      }
    }, 10000);

    const cleanupPresence = getOnlineUsers((users) => {
      if (mountedRef.current) setOnlineUsers(users || []);
    });

    startChatPoll((data) => {
      if (mountedRef.current) {
        setMessages(data || []);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      stopChatPoll();
      cleanupPresence();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setSending(true);
    setText('');
    try {
      await sendMessage(user?.uid || 'unknown', user?.displayName || user?.name || 'User', msgText);
    } catch (err) {
      console.error('Send error:', err);
      setText(msgText);
    }
    setSending(false);
  };

  const groupedMessages = (messages || []).reduce((groups, msg) => {
    const date = formatDate(msg.created_at || msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-primary)',
      paddingBottom: '70px'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex', 
        alignItems: 'center', 
        gap: 12
      }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
        }}>💬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>FAMILY CHAT</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--mint)', fontWeight: 700 }}>
            {(onlineUsers || []).length} ONLINE
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>💬</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{error}</div>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: 16 }}>REFRESH</button>
          </div>
        ) : (messages || []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>💬</div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>Start the conversation</div>
            <div style={{ fontSize: '0.85rem' }}>Send a message to connect with family</div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <span style={{
                  background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 20,
                  fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)',
                  border: '1px solid var(--border-glass)'
                }}>{date.toUpperCase()}</span>
              </div>
              {dateMessages.map((msg, i) => {
                const isSent = msg.sender_id === user?.uid;
                const { tree } = getTreeAvatar(msg.sender_name);
                const prevMsg = dateMessages[i - 1];
                const showAvatar = !isSent && (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                return (
                  <div key={msg.id || i} style={{ 
                    alignSelf: isSent ? 'flex-end' : 'flex-start',
                    maxWidth: '80%', margin: '4px 0',
                    display: 'flex', flexDirection: 'column',
                    alignItems: isSent ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: isSent ? 'row-reverse' : 'row' }}>
                      {!isSent && <div style={{ fontSize: '1.2rem', opacity: showAvatar ? 1 : 0 }}>{tree}</div>}
                      <div style={{ 
                        background: isSent ? 'linear-gradient(135deg, var(--apple-blue), #0056CC)' : 'var(--bg-card)',
                        border: isSent ? 'none' : '1px solid var(--border-glass)',
                        borderRadius: isSent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        padding: '10px 14px'
                      }}>
                        <div style={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                          {msg.text || msg.message || ''}
                        </div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', marginTop: 4, textAlign: 'right' }}>
                          {formatTime(msg.created_at || msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div style={{ 
        padding: '8px 16px 16px', 
        borderTop: '1px solid var(--border-glass)',
        background: 'var(--bg-primary)'
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type message..."
            disabled={sending}
            style={{ 
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              borderRadius: 24, padding: '10px 16px', color: 'var(--text-primary)',
              fontSize: '0.9rem', outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={!text.trim() || sending}
            style={{ 
              width: 40, height: 40, borderRadius: '50%', 
              background: text.trim() && !sending ? 'var(--apple-blue)' : 'var(--bg-card)',
              color: '#fff', border: 'none', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              cursor: text.trim() && !sending ? 'pointer' : 'default'
            }}
          >
            {sending ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}
