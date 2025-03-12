import React, { useState } from 'react';
import { Send, Mic, Image, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  className?: string;
}

export function ChatInput({ onSend, className }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className={cn('flex gap-2', className)}
    >
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm resize-none"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              'p-2 rounded-xl text-white/80 transition-colors',
              isRecording ? 'bg-red-500/50 text-white' : 'bg-white/10 hover:bg-white/20'
            )}
          >
            <Mic size={20} />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
          >
            <Image size={20} />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
          >
            <Paperclip size={20} />
          </motion.button>
        </div>
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg shadow-purple-500/25"
      >
        <Send size={20} />
      </motion.button>
    </motion.form>
  );
}