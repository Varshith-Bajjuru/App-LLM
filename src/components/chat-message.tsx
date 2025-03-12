import React from 'react';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
  timestamp?: Date;
  className?: string;
}

export function ChatMessage({ message, isAi, timestamp, className }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-start gap-4 p-6 rounded-2xl backdrop-blur-sm',
        isAi ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/10',
        className
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-2xl flex items-center justify-center',
          isAi ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-orange-500 to-pink-500'
        )}
      >
        {isAi ? <Bot size={24} className="text-white" /> : <User size={24} className="text-white" />}
      </div>
      <div className="flex-1">
        <ReactMarkdown
          className="text-sm text-white/90 leading-relaxed prose prose-invert"
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message}
        </ReactMarkdown>
        {timestamp && (
          <div className="mt-2 text-xs text-white/40">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}