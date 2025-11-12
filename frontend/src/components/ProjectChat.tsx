import { useState, useEffect, useRef } from 'react';
import { Send, Loader, MessageCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Message {
  id: number;
  sender_id: number;
  message: string;
  created_at: string;
  sender_name?: string;
}

interface ProjectChatProps {
  projectId: number;
  applicationAccepted: boolean;
  currentUserId: number;
}

export default function ProjectChat({ projectId, applicationAccepted, currentUserId }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (applicationAccepted) {
      fetchMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [applicationAccepted, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/ai-copilot/messages/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('access_token');
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

  if (!applicationAccepted) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Chat will be available once your application is accepted</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Project Chat
        </h3>
        <p className="text-sm text-gray-500 mt-1">Collaborate with your team</p>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto px-6 py-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
