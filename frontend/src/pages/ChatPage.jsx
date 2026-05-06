import React, { useState, useEffect, useRef } from 'react';
import { fetchMessages, sendMessage, voteMessage, getOnlineUsers, startChatPoll, stopChatPoll } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const TREES = ['🌳', '🌴', '🌲', '🌵', '🎄', '🌿', '🍀', '🌱', '🍃'];
const TREE_COLORS = ['#06D6A0', '#4CC9F0', '#FFD700', '#E53170', '#7B2FFF', '#FF6B6B', '#3D5A80', '#F72585', '#4361EE', '#FF9F1C'];

function getTreeAvatar(name) {
  if (!name) return { tree: TREES[0], color: TREE_COLORS[0] };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return { 
    tree: TREES[Math.abs(hash) % TREES.length], 
    color: TREE_COLORS[Math.abs(hash) % TREE_COLORS.length] 
  };
}

function formatTime(createdAt) {
  if (!createdAt) return '';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(createdAt) {
  if (!createdAt) return 'Unknown';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'TODAY';
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
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
  const scrollRef = useRef(null);
  const mountedRef = useRef(true);
  const inputRef = useRef(null);

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
        const msgs = data || [];
        setMessages(msgs);
        setLoading(false);
        setError(null);
        // Auto-scroll to bottom
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      stopChatPoll();
      cleanupPresence();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    
    setSending(true);
    setError(null);
    const messageText = text.trim();
    setText('');

    try {
      await sendMessage(user.uid, user.displayName || user.name, messageText);
      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      console.error('Send error:', err);
      setError('Failed to send. Tap to retry.');
    }
    setSending(false);
  };

  const handleVote = async (msgId, type) => {
    try {
      await voteMessage(msgId, user?.uid, type);
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = formatDateHeader(msg.createdAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100dvh - 60px)' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Online Users Bar */}
      <div style={{
        padding: '8px 12px',
        background: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        zIndex: 20,
        position: 'sticky',
        top: 0
      }}>
        <div style={{ 
          width: 28, 
          height: 28, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '0.9rem',
          flexShrink: 0
        }}>
          💬
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 2 }}>
            FAMILY CONNECT
          </div>
          {onlineUsers.length > 0 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--mint)', fontWeight: 700 }}>
                {onlineUsers.length} ONLINE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="chat-messages" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div style={{
              textAlign: 'center',
              margin: '12px 0 8px',
              position: 'relative'
            }}>
              <span style={{
                background: 'var(--bg-card)',
                padding: '3px 12px',
                borderRadius: 12,
                fontSize: '0.55rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                letterSpacing: 1,
                border: '1px solid var(--border-glass)',
                display: 'inline-block'
              }}>
                {date}
              </span>
            </div>
            {msgs.map((msg, idx) => {
              const isMe = msg.user_id === user.uid;
              const { tree, color } = getTreeAvatar(msg.user_name);
              const prevMsg = msgs[idx - 1];
              const showAvatar = !isMe && (!prevMsg || prevMsg.user_id !== msg.user_id);
              const showName = showAvatar;

              return (
                <div key={msg.id} style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: 4,
                  animation: 'slide-up 0.3s ease-out'
                }}>
                  {showName && (
                    <div style={{
                      fontSize: '0.55rem',
                      color: color,
                      fontWeight: 800,
                      marginBottom: 2,
                      marginLeft: isMe ? 0 : 32,
                      letterSpacing: 0.5
                    }}>
                      {(msg.user_name || 'FAMILY').toUpperCase()}
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 6,
                    flexDirection: isMe ? 'row-reverse' : 'row'
                  }}>
                    {!isMe && showAvatar && (
                      <div style={{
                        fontSize: '1.1rem',
                        opacity: 1,
                        transition: 'opacity 0.2s',
                        flexShrink: 0,
                        marginTop: 'auto'
                      }}>
                        {tree}
                      </div>
                    )}
                    <div style={{
                      background: isMe 
                        ? 'linear-gradient(135deg, var(--apple-blue) 0%, #0056CC 100%)' 
                        : 'var(--bg-card)',
                      border: isMe ? 'none' : '1px solid var(--border-glass)',
                      borderRadius: isMe 
                        ? '16px 16px 4px 16px' 
                        : '16px 16px 16px 4px',
                      padding: '8px 12px',
                      boxShadow: isMe 
                        ? '0 2px 8px rgba(0, 113, 227, 0.2)' 
                        : '0 1px 4px rgba(0,0,0,0.05)',
                      maxWidth: '100%'
                    }}>
                      <div style={{
                        color: isMe ? '#fff' : 'var(--text-primary)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.text}
                      </div>
                      <div style={{
                        fontSize: '0.5rem',
                        color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                        marginTop: 3,
                        textAlign: 'right',
                        fontWeight: 600
                      }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            flex: 1
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 12,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              animation: 'float 3s ease-in-out infinite'
            }}>
              💬
            </div>
            <div style={{
              fontWeight: 800,
              fontSize: '1.1rem',
              marginBottom: 6,
              color: 'var(--text-primary)'
            }}>
              Start the conversation
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              Send a message to connect with family
            </div>
          </div>
        )}
      </div>

      {/* Message Input - WhatsApp Style */}
      <div className="chat-input-wrapper">
        {error && (
          <div style={{
            color: 'var(--primary-pink)',
            fontSize: '0.7rem',
            marginBottom: 6,
            textAlign: 'center',
            fontWeight: 600,
            cursor: 'pointer'
          }} onClick={() => window.location.reload()}>
            {error} → Tap to refresh
          </div>
        )}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          background: 'var(--bg-card)',
          borderRadius: 24,
          padding: '6px 8px 6px 14px',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              padding: '6px 0',
              flex: 1,
              outline: 'none',
              color: 'var(--text-primary)',
              minWidth: 0
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: text.trim() && !sending 
                ? 'linear-gradient(135deg, var(--apple-blue) 0%, #0056CC 100%)' 
                : 'var(--bg-card)',
              color: text.trim() ? '#fff' : 'var(--text-muted)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: text.trim() && !sending ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              boxShadow: text.trim() && !sending 
                ? '0 2px 8px rgba(0, 113, 227, 0.3)' 
                : 'none',
              flexShrink: 0
            }}
          >
            {sending ? (
              <div style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
        <div style={{
          textAlign: 'center',
          marginTop: 4,
          fontSize: '0.5rem',
          color: 'var(--text-muted)',
          fontWeight: 800,
          letterSpacing: 1
        }}>
          MADE WITH ❤️ FOR OUR FAMILY
        </div>
      </div>
    </div>
  );
}
