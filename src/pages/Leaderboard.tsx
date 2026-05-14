import React, { useEffect, useState } from 'react';
import GlobalLeaderboard from '../components/GlobalLeaderboard';

const CURRENT_USER_ID = 'u1';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(err => console.error("Failed to fetch leaderboard", err));
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <h1 className="text-3xl font-black">Top Forecasters</h1>
      <p className="text-gray-400 mb-4">Rankings are based on total prediction points earned. Reach 1000 points for Platinum tier!</p>
      
      <GlobalLeaderboard users={leaderboard} currentUserId={CURRENT_USER_ID} />
    </div>
  );
}
