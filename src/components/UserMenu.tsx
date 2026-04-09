'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, History, ChevronDown, BarChart3 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 md:px-4 glass hover-lift rounded-lg transition-colors min-h-[44px]"
      >
        <User className="w-4 h-4" />
        <span className="text-sm hidden md:inline">{user?.email?.split('@')[0]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-48 glass p-2 rounded-lg shadow-xl z-50"
          >
            <div className="space-y-1">
              <Link
                href="/history"
                className="flex items-center gap-2 px-3 py-3 text-sm text-gray-300 hover:bg-white/5 rounded transition-colors min-h-[44px]"
                onClick={() => setIsOpen(false)}
              >
                <History className="w-4 h-4" />
                <span>Generation History</span>
              </Link>
              
              <div className="border-t border-white/10 my-2" />
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded transition-colors w-full text-left min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
