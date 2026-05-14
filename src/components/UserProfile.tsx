import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Zap } from 'lucide-react';
import clsx from 'clsx';

interface UserProfileProps {
  user: {
    username: string;
    totalPoints: number;
    currentStreak: number;
    highestStreak: number;
    tierLevel: string;
  } | null;
}

export default function UserProfile({ user }: UserProfileProps) {
  if (!user) return <div className="animate-pulse bg-gray-900 rounded-2xl h-32"></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black mb-1">{user.username}</h1>
          <div className="flex items-center gap-2 text-sm">
            <div className={clsx("px-2 py-0.5 rounded font-bold uppercase tracking-wider text-xs",
              user.tierLevel === 'Bronze' ? 'bg-orange-500/20 text-orange-400' :
              user.tierLevel === 'Silver' ? 'bg-gray-400/20 text-gray-300' :
              user.tierLevel === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-cyan-500/20 text-cyan-400'
            )}>
              {user.tierLevel} TIER
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <StatBox icon={<Star className="w-5 h-5 text-emerald-400" />} label="Total Points" value={user.totalPoints} />
          <StatBox icon={<Flame className="w-5 h-5 text-orange-500" />} label="Current Streak" value={user.currentStreak} />
          <StatBox icon={<Zap className="w-5 h-5 text-yellow-400" />} label="Best Streak" value={user.highestStreak} />
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-gray-950/50 rounded-xl p-4 min-w-[120px] border border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black font-mono">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
