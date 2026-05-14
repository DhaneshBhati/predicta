import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trophy, CheckCircle } from 'lucide-react';

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  matchTime: string | number; // Note: comes from SQLite as number due to configuration
  status: 'upcoming' | 'live' | 'finished';
  teamALogo: string;
  teamBLogo: string;
  liveScoreText?: string;
}

interface MatchCardProps {
  match: Match;
  onPredict: (matchId: string, result: 'teamA' | 'teamB' | 'draw') => Promise<void>;
}

export default function MatchCard({ match, onPredict }: MatchCardProps) {
  const [predicted, setPredicted] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePredict = async (result: 'teamA' | 'teamB' | 'draw') => {
    if (predicted || isSubmitting) return;
    setIsSubmitting(true);
    await onPredict(match.id, result);
    setPredicted(result);
    setIsSubmitting(false);
  };

  const isLive = match.status === 'live';
  const matchDate = new Date(match.matchTime);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden"
    >
      {isLive && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
        </div>
      )}
      
      <div className="text-center text-sm text-gray-400 mb-4 tracking-wider uppercase font-semibold">
        {format(matchDate, 'MMM do, p')}
      </div>

      {match.liveScoreText && (
        <div className="text-center text-xs font-mono text-emerald-400 mb-4 bg-emerald-900/20 py-1 px-2 rounded w-fit mx-auto border border-emerald-500/20">
          {match.liveScoreText}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        {/* Team A */}
        <div className="flex flex-col items-center gap-3 w-[40%]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex shrink-0 border border-gray-700/50 relative group overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src={match.teamALogo} alt={match.teamA} className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" referrerPolicy="no-referrer" />
          </div>
          <span className="font-bold text-center leading-tight tracking-wide text-sm sm:text-base text-gray-200">{match.teamA}</span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center justify-center w-[20%] h-full">
          <div className="bg-gray-800/80 px-3 py-1 rounded-lg border border-gray-700/50 shadow-inner">
            <span className="text-sm font-black text-gray-400 italic">VS</span>
          </div>
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center gap-3 w-[40%]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex shrink-0 border border-gray-700/50 relative group overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src={match.teamBLogo} alt={match.teamB} className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" referrerPolicy="no-referrer" />
          </div>
          <span className="font-bold text-center leading-tight tracking-wide text-sm sm:text-base text-gray-200">{match.teamB}</span>
        </div>
      </div>

      {/* Prediction Action Area */}
      <div className="mt-4">
        {predicted ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-900/40 border border-emerald-500/50 rounded-xl p-4 text-center text-emerald-400 flex flex-col items-center gap-2"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Prediction Locked In!</span>
          </motion.div>
        ) : (
          <div className="flex gap-2">
            <PredictionButton 
              label={match.teamA} 
              onClick={() => handlePredict('teamA')} 
              disabled={isSubmitting} 
            />
            <PredictionButton 
              label="Draw" 
              onClick={() => handlePredict('draw')} 
              disabled={isSubmitting} 
              className="bg-gray-800 hover:bg-gray-700 w-1/4"
            />
            <PredictionButton 
              label={match.teamB} 
              onClick={() => handlePredict('teamB')} 
              disabled={isSubmitting} 
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PredictionButton({ label, onClick, disabled, className = "bg-blue-600 hover:bg-blue-500 flex-1" }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${className} rounded-xl py-3 px-2 font-bold text-sm text-white shadow-lg disabled:opacity-50 transition-colors`}
    >
      {label}
    </motion.button>
  );
}
