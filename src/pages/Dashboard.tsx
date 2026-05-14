import React, { useEffect, useState } from 'react';
import UserProfile from '../components/UserProfile';
import MatchCard from '../components/MatchCard';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import AIQuestCard from '../components/AIQuestCard';

const CURRENT_USER_ID = 'u1'; // Mock logged-in user

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [quest, setQuest] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [uRes, mRes, lRes] = await Promise.all([
        fetch(`/api/users/${CURRENT_USER_ID}`),
        fetch('/api/matches'),
        fetch('/api/leaderboard')
      ]);

      if (uRes.ok) setUser(await uRes.json());
      if (mRes.ok) setMatches(await mRes.json());
      if (lRes.ok) setLeaderboard(await lRes.json());

      // Fetch AI Quest separately so it doesn't block main render
      fetch(`/api/ai/quests/${CURRENT_USER_ID}`)
        .then(res => res.json())
        .then(data => setQuest(data))
        .catch(err => console.error("Failed to load quest", err));

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Poll for live matches every 10 seconds
    const interval = setInterval(() => {
      fetch('/api/matches')
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error("Failed to poll matches", err));
    }, 10000);
    
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
          wagerAmount: 50 // Fixed wager for demo
        })
      });
      console.log("Prediction submitted! In a real app, this might optimistically update points.");
    } catch (e) {
      console.error("Failed to predict", e);
    }
  };

  return (
    <div className="flex flex-col gap-10 sm:gap-12 w-full max-w-full xl:max-w-7xl 2xl:max-w-[100rem] mx-auto">
      {/* Top Section: User Profile */}
      <UserProfile user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Matches Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Live & Upcoming Matches</h2>
            
            {/* Admin trigger for demonstration purposes */}
            <button 
              onClick={() => {
                const liveMatch = matches.find((m: any) => m.status === 'live');
                if (liveMatch) {
                  fetch(`/api/matches/${liveMatch.id}/resolve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ actualResult: 'teamA' })
                  }).then(() => fetchDashboardData());
                } else {
                  alert("No live match to resolve!");
                }
              }}
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-700 text-gray-400"
            >
              [Admin] Resolve Live Match
            </button>
          </div>
          
          {matches.slice(0, 3).map((match: any) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onPredict={handlePredict} 
            />
          ))}

          {matches.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
              No matches at the moment.
            </div>
          )}
        </div>

        {/* Sidebar: Leaderboard & Quests */}
        <div className="flex flex-col gap-6">
          <AIQuestCard quest={quest} />
          <GlobalLeaderboard users={leaderboard} currentUserId={CURRENT_USER_ID} />
        </div>
      </div>
    </div>
  );
}
