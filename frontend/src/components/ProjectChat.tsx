import { useState, useEffect, useRef } from 'react';
import { Send, Loader, Check, CheckCheck, Circle, Image as ImageIcon, Paperclip, Smile } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Message {
  id: number;
  sender_id: number;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  is_read?: boolean;
  read_by_user_ids?: number[];
}

interface TypingUser {
  user_id: number;
  user_name: string;
}

interface OnlineStatus {
  is_online: boolean;
  last_seen: string;
}

interface ProjectChatProps {
  projectId: number;
  applicationAccepted: boolean;
  currentUserId: number;
  otherUserId?: number; // The ID of the other person in the chat
  otherUserName?: string;
}

export default function ProjectChat({
  projectId,
  applicationAccepted,
  currentUserId,
  otherUserId,
  otherUserName
}: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (applicationAccepted) {
      fetchMessages();
      updateOnlineStatus(true);

      // Poll for new messages, typing indicators every 2 seconds
      const interval = setInterval(() => {
        fetchMessages();
        fetchTypingIndicators();
        if (otherUserId) {
          fetchOnlineStatus();
        }
      }, 2000);

      // Mark as online on mount
      const heartbeat = setInterval(() => {
        updateOnlineStatus(true);
      }, 30000); // Update every 30 seconds

      return () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        updateOnlineStatus(false);
      };
    }
  }, [applicationAccepted, projectId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/ai-copilot/messages/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });

      const msgs = response.data || [];
      setMessages(msgs.reverse()); // Reverse to show oldest first

      // Mark messages as read
      markMessagesAsRead();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/ai-copilot/messages/mark-all-read/${projectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchTypingIndicators = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/ai-copilot/typing/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTypingUsers(response.data || []);
    } catch (error) {
      // Silently fail
    }
  };

  const fetchOnlineStatus = async () => {
    if (!otherUserId) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/ai-copilot/online-status/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnlineStatus(response.data);
    } catch (error) {
      // Silently fail
    }
  };

  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/ai-copilot/online-status`,
        { is_online: isOnline },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      // Silently fail
    }
  };

  const handleTyping = () => {
    const token = localStorage.getItem('access_token');

    // Send typing indicator
    axios.post(
      `${API_URL}/ai-copilot/typing/${projectId}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => {});

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      axios.post(
        `${API_URL}/ai-copilot/typing/${projectId}/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    }, 3000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('access_token');

      // Stop typing indicator
      await axios.post(
        `${API_URL}/ai-copilot/typing/${projectId}/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `${API_URL}/ai-copilot/messages`,
        {
          project_id: projectId,
          message: newMessage,
          message_type: 'text'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  const shouldGroupMessage = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return false;
    const isSameSender = currentMsg.sender_id === prevMsg.sender_id;
    const timeDiff = new Date(currentMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime();
    return isSameSender && timeDiff < 60000; // Group if within 1 minute
  };

  const getLastSeenText = () => {
    if (!onlineStatus) return '';
    if (onlineStatus.is_online) return 'online';

    const lastSeen = new Date(onlineStatus.last_seen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

    if (diffMinutes < 1) return 'last seen just now';
    if (diffMinutes < 60) return `last seen ${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `last seen ${diffHours}h ago`;

    return `last seen ${formatDateSeparator(onlineStatus.last_seen)}`;
  };

  if (!applicationAccepted) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center shadow-lg border border-blue-100">
        <div className="bg-white rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-md">
          <Send className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Chat Unavailable</h3>
        <p className="text-gray-600">The chat will be available once your application is accepted</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* WhatsApp-style Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-lg shadow-md">
              {otherUserName ? otherUserName.charAt(0).toUpperCase() : 'C'}
            </div>
            {onlineStatus?.is_online && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {otherUserName || 'Chat'}
            </h3>
            <p className="text-xs text-emerald-50">
              {getLastSeenText()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area with WhatsApp pattern background */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
        style={{
          backgroundColor: '#efeae2',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <Loader className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md">
              <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Send className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No messages yet</p>
              <p className="text-sm text-gray-500">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwnMessage = msg.sender_id === currentUserId;
              const showDate = shouldShowDateSeparator(msg, messages[index - 1]);
              const grouped = shouldGroupMessage(msg, messages[index - 1]);

              return (
                <div key={msg.id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className="bg-white px-4 py-1 rounded-lg shadow-sm">
                        <p className="text-xs font-medium text-gray-600">
                          {formatDateSeparator(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-1' : 'mt-3'}`}>
                    <div
                      className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                        isOwnMessage
                          ? 'bg-emerald-500 text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 rounded-tl-sm'
                      }`}
                      style={{
                        animation: 'slideIn 0.2s ease-out'
                      }}
                    >
                      {/* Sender name for grouped messages */}
                      {!isOwnMessage && !grouped && (
                        <p className="text-xs font-semibold text-emerald-600 mb-1">
                          {msg.sender_name || 'User'}
                        </p>
                      )}

                      {/* Message text */}
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      {/* Timestamp and read receipt */}
                      <div className={`flex items-center justify-end gap-1 mt-1`}>
                        <p className={`text-xs ${isOwnMessage ? 'text-emerald-50' : 'text-gray-500'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                        {isOwnMessage && (
                          <span className="ml-1">
                            {msg.is_read ? (
                              <CheckCheck className="w-4 h-4 text-blue-300" />
                            ) : (
                              <Check className="w-4 h-4 text-emerald-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start mt-3">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-md max-w-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Circle className="w-2 h-2 fill-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <Circle className="w-2 h-2 fill-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <Circle className="w-2 h-2 fill-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500">
                  {typingUsers[0].user_name} is typing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Area */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 bg-white rounded-full shadow-sm border border-gray-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
            <div className="flex items-center px-4 py-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                disabled={sending}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              sending || !newMessage.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105 active:scale-95'
            }`}
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
