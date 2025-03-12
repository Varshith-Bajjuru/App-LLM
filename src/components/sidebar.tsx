import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Clock, Bookmark, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const menuItems = [
    { icon: MessageSquare, label: 'New Chat', action: () => {} },
    { icon: Clock, label: 'History', action: () => {} },
    { icon: Bookmark, label: 'Saved', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
    { icon: HelpCircle, label: 'Help', action: () => {} },
  ];

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-white">Menu</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <X size={20} className="text-white" />
        </motion.button>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-white mb-2">Pro Features</h3>
          <p className="text-sm text-white/60">
            Upgrade to access advanced AI features, unlimited messages, and priority support.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Upgrade Now
          </motion.button>
        </div>
      </div>
    </div>
  );
}