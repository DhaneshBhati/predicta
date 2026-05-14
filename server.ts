import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, initDB } from './src/db';
import { users, matches, predictions, activityLogs } from './src/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure DB is initialized
  initDB();

  // --- Background Task ---
  async function syncLiveMatches() {
    try {
      const response = await fetch('https://www.espncricinfo.com/rss/livescores.xml');
      if (!response.ok) return;
      const text = await response.text();
      const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<guid>(.*?)<\/guid>[\s\S]*?<\/item>/g;
      
      let match;
      while ((match = itemRegex.exec(text)) !== null) {
        let title = match[1];
        let guid = match[2];
        
        let [teamAPart, teamBPart] = title.split(' v ');
        if (!teamBPart) continue; // Not a typical match format
        
        let teamA = teamAPart.replace(/[0-9\/\*\s]+$/, '').trim();
        let teamB = teamBPart.replace(/[0-9\/\*\s]+$/, '').trim();
        
        const existing = await db.select().from(matches).where(eq(matches.id, guid)).get();
        if (existing) {
          await db.update(matches).set({
            liveScoreText: title,
            status: title.includes('*') ? 'live' : 'finished',
          }).where(eq(matches.id, guid));
        } else {
          // New match
          await db.insert(matches).values({
            id: guid,
            teamA: teamA,
            teamB: teamB,
            matchTime: new Date(),
            status: title.includes('*') ? 'live' : 'upcoming',
            teamALogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(teamA.substring(0,3).toUpperCase())}&background=random&color=fff`,
            teamBLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(teamB.substring(0,3).toUpperCase())}&background=random&color=fff`,
            liveScoreText: title,
          });
        }
      }
    } catch (e) {
      console.error("RSS Sync Error:", e);
    }
  }

  // Initial sync and then every 10 seconds
  syncLiveMatches();
  setInterval(syncLiveMatches, 10000);

  // --- API Routes ---

  // 1. Get User Profile
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, req.params.userId)).get();
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2. Get Matches
  app.get('/api/matches', async (req, res) => {
    try {
      const allMatches = await db.select().from(matches).orderBy(matches.matchTime).all();
      res.json(allMatches);
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 3. Submit Prediction (The Gamification Engine part 1)
  app.post('/api/predictions', async (req, res) => {
    const { userId, matchId, predictedResult, wagerAmount } = req.body;
    try {
      const predictionId = `p_${Date.now()}`;
      await db.insert(predictions).values({
        id: predictionId,
        userId,
        matchId,
        predictedResult,
        wagerAmount
      });
      
      await db.insert(activityLogs).values({
        id: `log_${Date.now()}`,
        userId,
        actionType: 'prediction',
        timestamp: new Date()
      });

      res.json({ success: true, message: 'Prediction locked in!', id: predictionId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to submit prediction' });
    }
  });

  // 4. Resolve Match (The Gamification Engine part 2)
  app.post('/api/matches/:matchId/resolve', async (req, res) => {
    const { matchId } = req.params;
    const { actualResult } = req.body; // teamA, teamB, or draw

    try {
      // Update match status
      await db.update(matches).set({ status: 'finished', actualResult }).where(eq(matches.id, matchId));

      // Get all predictions for this match
      const matchPredictions = await db.select().from(predictions).where(eq(predictions.matchId, matchId)).all();

      for (const pred of matchPredictions) {
        const isCorrect = pred.predictedResult === actualResult;
        const user = await db.select().from(users).where(eq(users.id, pred.userId)).get();
        if (!user) continue;

        if (isCorrect) {
          // Award points (e.g., 2x wager for now)
          const pointsWon = pred.wagerAmount * 2;
          const newTotal = user.totalPoints + pointsWon;
          const newStreak = user.currentStreak + 1;
          const newHighestStreak = Math.max(user.highestStreak, newStreak);
          
          // Tier logic
          let newTier = user.tierLevel;
          if (newTotal >= 1000) newTier = 'Platinum';
          else if (newTotal >= 500) newTier = 'Gold';
          else if (newTotal >= 200) newTier = 'Silver';

          await db.update(users).set({
            totalPoints: newTotal,
            currentStreak: newStreak,
            highestStreak: newHighestStreak,
            tierLevel: newTier
          }).where(eq(users.id, user.id));

          await db.update(predictions).set({
            status: 'correct',
            pointsAwarded: pointsWon
          }).where(eq(predictions.id, pred.id));
        } else {
          // Reset streak
          await db.update(users).set({ currentStreak: 0 }).where(eq(users.id, user.id));
          await db.update(predictions).set({ status: 'incorrect' }).where(eq(predictions.id, pred.id));
        }
      }

      res.json({ success: true, message: 'Match resolved and points awarded.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to resolve match' });
    }
  });

  // 5. Global Leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const topUsers = await db.select().from(users).orderBy(desc(users.totalPoints)).limit(10).all();
      res.json(topUsers);
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 6. Adaptive Behavior Engine
  app.get('/api/ai/quests/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const userLogs = await db.select().from(activityLogs)
        .where(eq(activityLogs.userId, userId))
        .orderBy(desc(activityLogs.timestamp))
        .limit(10).all();
        
      const userDbInfo = await db.select().from(users).where(eq(users.id, userId)).get();
      if (!userDbInfo) return res.status(404).json({error: "User not found"});

      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Act as an Adaptive AI for a sports prediction platform.
User profile: ${JSON.stringify({
  points: userDbInfo.totalPoints, 
  tier: userDbInfo.tierLevel,
  streak: userDbInfo.currentStreak
})}
Recent activity logs (JSON): ${JSON.stringify(userLogs)}

Based on this minimal user behavior, generate a single, highly engaging personalized push notification or "Quest" to re-engage them. 
Respond with a JSON object containing exactly two string properties: "title" and "message".
Example: {"title": "Quest: Comeback Kid!", "message": "You lost your streak, but predicting the next match will give you a 2x bonus!"}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const responseData = JSON.parse(response.text || '{"title": "Daily Quest", "message": "Make a prediction today for bonus points!"}');
      res.json(responseData);
    } catch (e: any) {
      console.error("AI Quest Error:", e.message || e);
      res.json({ title: "Daily Quest", message: "Make a prediction today for a 2x bonus!" });
    }
  });

  // --- End API Routes ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
