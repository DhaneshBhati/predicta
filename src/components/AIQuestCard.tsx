import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIQuest {
  title: string;
  message: string;
}

export default function AIQuestCard({ quest }: { quest: AIQuest | null }) {
  if (!quest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 border border-fuchsia-500/30 rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24" />
      </div>
      
      <div className="flex items-center gap-2 mb-2 text-fuchsia-400">
        <Sparkles className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">Adaptive Quest</span>
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-white">{quest.title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{quest.message}</p>
      
      <button className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-bold py-2 px-4 rounded-lg w-full transition-colors shadow-lg shadow-fuchsia-900/20">
        Accept Quest
      </button>
    </motion.div>
  );
}
