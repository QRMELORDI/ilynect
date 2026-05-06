import React, { useState, useEffect, useRef } from 'react';
import { fetchMessages, sendMessage, getOnlineUsers, startChatPoll, stopChatPoll } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

const TREE_COLORS = ['#06D6A0', '#4CC9F0', '#FFD700', '#E53170', '#7B2FFF', '#FF6B6B', '#3D5A80', '#F72585', '#4361EE', '#FF9F1C'];

function getAvatarColor(name) {
  if (!name) return TREE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return TREE_COLORS[Math.abs(hash) % TREE_COLORS.length];
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const cleanupPresence = getOnlineUsers((users) => setOnlineUsers(users || []));

    startChatPoll((data) => {
      setMessages(data || []);
      setLoading(false);
    });

    return () => {
      stopChatPoll();
      cleanupPresence();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const groupedMessages = (messages || []).reduce((groups, msg) => {
    const date = formatDate(msg.created_at || msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div style={{ 
      height: '100dvh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--apple-bg)',
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--apple-border-light)',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        display: 'flex', 
        alignItems: 'center', 
        gap: 12
      }}>
        <div style={{ 
          width: 42, height: 42, borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--apple-green), var(--apple-teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
        }}>💬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Family Chat</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--apple-green)', fontWeight: 600 }}>
            {(onlineUsers || []).length} online
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : (messages || []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>💬</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>Start the conversation</div>
            <div style={{ fontSize: '0.85rem' }}>Send a message to connect with family</div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div style={{ textAlign: 'center', margin: '16px 0 8px' }}>
                <span style={{
                  background: 'var(--apple-card)', padding: '4px 14px', borderRadius: 20,
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                  border: '1px solid var(--apple-border-light)'
                }}>{date}</span>
              </div>
              {dateMessages.map((msg, i) => {
                const isSent = msg.sender_id === user?.uid;
                const color = getAvatarColor(msg.sender_name);
                const prevMsg = dateMessages[i - 1];
                const showName = !isSent && (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                return (
                  <div key={msg.id || i} style={{ 
                    maxWidth: '80%', 
                    alignSelf: isSent ? 'flex-end' : 'flex-start',
                  }}>
                    {showName && (
                      <div style={{ fontSize: '0.7rem', color, fontWeight: 700, marginBottom: 4, marginLeft: 4 }}>
                        {msg.sender_name || 'Unknown'}
                      </div>
                    )}
                    <div style={{ 
                      background: isSent ? '#0056CC' : 'var(--apple-card)',
                      border: isSent ? 'none' : '1px solid var(--apple-border-light)',
                      borderRadius: isSent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '10px 14px',
                      color: isSent ? '#fff' : 'var(--text-primary)',
                    }}>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {msg.text || msg.message || ''}
                      </div>
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: isSent ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', 
                        marginTop: 4, 
                        textAlign: 'right' 
                      }}>
                        {formatTime(msg.created_at || msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Input Bar - WhatsApp Style */}
      <form 
        onSubmit={handleSend} 
        style={{ 
          padding: '8px 12px',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--apple-border-light)',
          background: 'var(--apple-bg-secondary)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          style={{ 
            flex: 1, 
            background: 'var(--apple-card)', 
            border: '1px solid var(--apple-border)',
            borderRadius: 24, 
            padding: '12px 16px', 
            color: 'var(--text-primary)',
            fontSize: '1rem', 
            outline: 'none',
            minHeight: 44,
          }}
        />
        <button 
          type="submit" 
          disabled={!text.trim() || sending}
          style={{ 
            width: 44, height: 44, borderRadius: '50%', 
            background: text.trim() && !sending ? 'var(--apple-blue)' : 'var(--apple-card)',
            color: '#fff', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: text.trim() && !sending ? 'pointer' : 'default',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {sending ? (
            <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          )}
        </button>
      </form>
    </div>
  );
}
