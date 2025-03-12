import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, Volume2, Upload, History, Settings } from 'lucide-react';
import { ChatMessage } from './components/chat-message';
import { ChatInput } from './components/chat-input';
import { ThemeToggle } from './components/ui/theme-toggle';
import { Sidebar } from './components/sidebar';
import { getRandomGradient, cn } from './lib/utils';

interface Message {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: Date;
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isAi: true,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [gradientClass, setGradientClass] = useState(getRandomGradient());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSendMessage = async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      isAi: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm a placeholder response. API integration coming soon!",
        isAi: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      setGradientClass(getRandomGradient());
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 animate-gradient bg-[length:400%_400%]" />
      <div className="absolute inset-0 backdrop-blur-3xl" />

      <div className="relative h-screen flex">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-72 bg-white/10 backdrop-blur-lg border-r border-white/10"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                  gradientClass
                )}
              >
                <MessageSquare className="text-white" size={24} />
              </motion.button>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                AI Assistant
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              >
                <History size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              >
                <Settings size={20} />
              </motion.button>
              <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            </div>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isAi={message.isAi}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-white/50">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-6 backdrop-blur-md">
              <ChatInput onSend={handleSendMessage} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;