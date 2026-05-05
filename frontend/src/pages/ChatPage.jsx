import React, { useState, useEffect, useRef } from 'react';
import { fetchMessages, sendMessage, voteMessage, getOnlineUsers, startChatPoll, stopChatPoll } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const TREES = ['🌳', '🌴', '🌲', '🌵', '🎄', '🎋', '🍀', '🌿', '🌱', '🍃'];
const TREE_COLORS = ['#06D6A0', '#4CC9F0', '#FFD700', '#E53170', '#7B2FFF', '#FF6B6B', '#3D5A80', '#F72585', '#4361EE', '#FF9F1C'];

function getTreeAvatar(name, index = 0) {
  if (!name) return { tree: TREES[0], color: TREE_COLORS[0] };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const treeIndex = Math.abs(hash) % TREES.length;
  const colorIndex = Math.abs(hash) % TREE_COLORS.length;
  return { tree: TREES[treeIndex], color: TREE_COLORS[colorIndex] };
}

function formatTime(createdAt) {
  if (!createdAt) return '';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(createdAt) {
  if (!createdAt) return '';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
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
  const scrollRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const cleanupPresence = getOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    startChatPoll((data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => {
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
      await sendMessage(user.uid, user.displayName || user.name, msgText);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error(err);
      setText(msgText);
    }
    setSending(false);
  };

  const handleVote = async (id, type) => {
    try {
      await voteMessage(id, user.uid, type);
    } catch (err) {
      console.error(err);
    }
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="page-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100dvh - 60px)', 
      paddingBottom: 0,
      background: 'var(--bg-primary)'
    }}>
      <div className="container" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        maxWidth: 600,
        padding: 0, 
        position: 'relative'
      }}>
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255,255,255,0.02)', 
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          zIndex: 20
        }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(123, 47, 255, 0.3)'
          }}>
            <span style={{ fontSize: '1.3rem' }}>💬</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              FAMILY CONNECT
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--mint)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                background: 'var(--mint)',
                display: 'inline-block'
              }} />
              {onlineUsers.length} ONLINE
            </div>
          </div>
          <button 
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
            onClick={() => window.location.reload()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>

        {onlineUsers.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            padding: '14px 16px', 
            background: 'rgba(123, 47, 255, 0.04)', 
            overflowX: 'auto',
            borderBottom: '1px solid var(--border-glass)',
            scrollbarWidth: 'none'
          }}>
            {onlineUsers.map(u => {
              const { tree, color } = getTreeAvatar(u.userName);
              return (
                <div 
                  key={u.id} 
                  style={{ 
                    textAlign: 'center', 
                    minWidth: 56, 
                    position: 'relative',
                    flexShrink: 0
                  }}
                  className="animate-float"
                >
                  <div style={{ 
                    fontSize: '1.8rem', 
                    marginBottom: 4,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                  }}>
                    {tree}
                  </div>
                  <div style={{ 
                    fontSize: '0.6rem', 
                    fontWeight: 800, 
                    color: 'var(--text-secondary)', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    maxWidth: 56,
                    letterSpacing: 0.5
                  }}>
                    {u.userName?.split(' ')[0]}
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: '50%',
                    transform: 'translateX(8px)',
                    width: 8, 
                    height: 8, 
                    background: 'var(--mint)', 
                    borderRadius: '50%', 
                    border: '1.5px solid var(--bg-primary)'
                  }} />
                </div>
              );
            })}
          </div>
        )}

        <div 
          ref={scrollRef} 
          className="chat-messages" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '12px 16px',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 0
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} className="animate-float">
                💬
              </div>
              <div className="empty-state-title" style={{ fontSize: '1.3rem', marginBottom: 8 }}>
                Start the conversation
              </div>
              <div className="empty-state-desc" style={{ fontSize: '0.9rem' }}>
                Send a message to connect with family
              </div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div style={{ 
                  textAlign: 'center', 
                  margin: '20px 0 16px',
                  position: 'relative'
                }}>
                  <span style={{
                    background: 'var(--bg-card)',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    letterSpacing: 1,
                    border: '1px solid var(--border-glass)'
                  }}>
                    {date.toUpperCase()}
                  </span>
                </div>
                {dateMessages.map((msg, i) => {
                  const isSent = msg.userId === user.uid;
                  const { tree, color } = getTreeAvatar(msg.userName, msg.userId);
                  const prevMsg = dateMessages[i-1];
                  const showName = !isSent && (!prevMsg || prevMsg.userId !== msg.userId);
                  const showAvatar = !isSent && (!prevMsg || prevMsg.userId !== msg.userId);

                  return (
                    <div 
                      key={msg.id} 
                      style={{ 
                        alignSelf: isSent ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSent ? 'flex-end' : 'flex-start',
                        marginBottom: 8,
                        animation: 'slide-up 0.3s ease-out'
                      }}
                    >
                      {showName && (
                        <div style={{ 
                          fontSize: '0.65rem', 
                          color: color, 
                          fontWeight: 800, 
                          marginBottom: 4, 
                          marginLeft: isSent ? 0 : 44,
                          letterSpacing: 0.5
                        }}>
                          {msg.userName.toUpperCase()}
                        </div>
                      )}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-end', 
                        gap: 6, 
                        flexDirection: isSent ? 'row-reverse' : 'row' 
                      }}>
                        {!isSent && (
                          <div 
                            style={{ 
                              fontSize: '1.4rem',
                              opacity: showAvatar ? 1 : 0,
                              transition: 'opacity 0.2s'
                            }}
                          >
                            {tree}
                          </div>
                        )}
                        <div 
                          className="chat-bubble"
                          style={{ 
                            background: isSent 
                              ? 'linear-gradient(135deg, var(--apple-blue) 0%, #0056CC 100%)' 
                              : 'var(--bg-card)',
                            border: isSent ? 'none' : '1px solid var(--border-glass)',
                            borderRadius: isSent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            boxShadow: isSent 
                              ? '0 6px 20px rgba(0, 113, 227, 0.25)' 
                              : '0 4px 12px rgba(0,0,0,0.08)',
                            padding: '12px 15px'
                          }}
                        >
                          <div style={{ 
                            color: '#fff', 
                            fontSize: '0.9rem', 
                            lineHeight: 1.4,
                            wordBreak: 'break-word'
                          }}>
                            {msg.text}
                          </div>
                          <div style={{ 
                            fontSize: '0.55rem', 
                            color: 'rgba(255,255,255,0.6)', 
                            marginTop: 4, 
                            textAlign: 'right',
                            fontWeight: 600
                          }}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: 16, 
                        marginTop: 4, 
                        padding: '0 4px',
                        opacity: 0.7
                      }}>
                        <button 
                          onClick={() => handleVote(msg.id, 'up')} 
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-muted)', 
                            fontSize: '0.7rem', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4, 
                            fontWeight: 700,
                            transition: 'all 0.2s'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 14l5-5 5 5z"/>
                          </svg>
                          {msg.upvotes || 0}
                        </button>
                        <button 
                          onClick={() => handleVote(msg.id, 'down')} 
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-muted)', 
                            fontSize: '0.7rem', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4, 
                            fontWeight: 700,
                            transition: 'all 0.2s'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                          </svg>
                          {msg.downvotes || 0}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div style={{ 
          padding: '12px 16px 40px', 
          background: 'rgba(255,255,255,0.01)', 
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid var(--border-glass)',
          zIndex: 20
        }}>
          <form 
            onSubmit={handleSend} 
            style={{ 
              display: 'flex', 
              gap: 10, 
              alignItems: 'center',
              background: 'var(--bg-card)',
              borderRadius: 24,
              padding: '6px 8px 6px 16px',
              border: '1px solid var(--border-glass)'
            }}
          >
            <input
              ref={inputRef}
              className="input"
              placeholder="Type message..."
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={sending}
              style={{ 
                borderRadius: 0, 
                background: 'transparent',
                border: 'none',
                fontSize: '0.9rem',
                padding: '8px 0',
                flex: 1
              }}
            />
            <button 
              type="submit" 
              disabled={!text.trim() || sending}
              style={{ 
                width: 42, 
                height: 42, 
                borderRadius: '50%', 
                background: text.trim() && !sending
                  ? 'linear-gradient(135deg, var(--apple-blue) 0%, #0056CC 100%)'
                  : 'var(--bg-card)',
                color: '#fff', 
                border: 'none',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: text.trim() && !sending ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                boxShadow: text.trim() && !sending ? '0 6px 20px rgba(0, 113, 227, 0.3)' : 'none'
              }}
            >
              {sending ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </form>
          <div style={{ 
            textAlign: 'center', 
            marginTop: 14, 
            fontSize: '0.6rem', 
            color: 'var(--text-muted)', 
            fontWeight: 800, 
            letterSpacing: 1 
          }}>
            MADE WITH ♥ FOR OUR FAMILY
          </div>
        </div>
      </div>
    </div>
  );
}