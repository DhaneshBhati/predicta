import React, { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';

const CURRENT_USER_ID = 'u1'; // Mock logged-in user

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = () => {
      fetch('/api/matches')
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error("Failed to fetch matches", err));
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePredict = async (matchId: string, result: 'teamA' | 'teamB' | 'draw') => {
    try {
      await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          matchId,
          predictedResult: result,
          wagerAmount: 50
        })
      });
    } catch (e) {
      console.error("Failed to predict", e);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">All Matches</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match: any) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onPredict={handlePredict} 
          />
        ))}

        {matches.length === 0 && (
          <div className="col-span-1 md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
            No matches available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
