import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame } from 'lucide-react';
import clsx from 'clsx';

interface User {
  id: string;
  username: string;
  totalPoints: number;
  currentStreak: number;
  tierLevel: string;
}

interface LeaderboardProps {
  users: User[];
  currentUserId: string;
}

export default function GlobalLeaderboard({ users, currentUserId }: LeaderboardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl sticky top-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold font-sans">Global Leaderboard</h2>
      </div>

      <div className="flex flex-col gap-3">
        {users.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-xl ${
                isCurrentUser 
                  ? 'bg-blue-900/30 border border-blue-500/50' 
                  : 'bg-gray-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="font-mono text-gray-500 font-bold w-4 text-right">
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {user.username}
                    {index === 0 && <Medal className="w-4 h-4 text-yellow-500" />}
                    {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                    {index === 2 && <Medal className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <span className={clsx(
                      user.tierLevel === 'Bronze' && 'text-orange-400',
                      user.tierLevel === 'Silver' && 'text-gray-300',
                      user.tierLevel === 'Gold' && 'text-yellow-400',
                      user.tierLevel === 'Platinum' && 'text-cyan-400'
                    )}>
                      {user.tierLevel}
                    </span>
                    {user.currentStreak > 2 && (
                      <span className="flex items-center gap-0.5 text-orange-500 ml-2">
                        <Flame className="w-3 h-3" /> {user.currentStreak}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="font-mono font-bold text-emerald-400">
                {user.totalPoints.toLocaleString()} <span className="text-xs text-gray-500">pts</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
