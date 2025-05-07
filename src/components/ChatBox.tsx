import React, { useState, useRef, useEffect } from 'react';
import { askBot } from '@/lib/api';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string; // ISO string
}

const LOCAL_STORAGE_KEY = 'chatMessages';
const quickReplies = ['What can you do?', 'Show me my tasks', 'Help', 'Reset'];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {
        console.error('Failed to parse messages from localStorage');
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat?')) {
      setMessages([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleSendMessage = async (input?: string) => {
    const messageToSend = input || userInput;
    if (!messageToSend.trim()) return;

    const timestamp = new Date().toISOString();

    const userMessage: Message = {
      text: messageToSend,
      sender: 'user',
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      const botResponse = await askBot(messageToSend);
      const botMessage: Message = {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Sorry, there was an error while processing your request.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const grouped: { [date: string]: Message[] } = {};
    for (const msg of messages) {
      const date = formatDate(msg.timestamp);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    }
    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full">
      {/* Clear Chat Button */}
      <div className="flex justify-end items-center px-4 pt-3">
        <button
          onClick={handleClearChat}
          className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md transition"
        >
          🗑️ Clear Chat
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, msgs], i) => (
          <div key={i} className="space-y-3">
            {/* Date Separator */}
            <div className="text-center text-xs text-gray-500">{date}</div>
            {msgs.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-xl shadow-sm max-w-[75%] text-base whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-green-100 text-black rounded-br-none'
                      : 'bg-gray-100 text-black rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-gray-500 mt-1 pr-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
          </div>
        ))}
        {isTyping && (
        <div className="flex items-center space-x-1 px-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
        </div>
      )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(reply)}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded-full transition"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="border-t px-4 py-3 flex items-center gap-2 bg-white">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          onClick={() => handleSendMessage()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
