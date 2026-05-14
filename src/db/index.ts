import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

// Initialize database with some default mock data if empty
export function initDB() {
  const tableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  
  if (!tableExists) {
    console.log("Initializing database tables...");
    
    // Create Tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        total_points INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        highest_streak INTEGER NOT NULL DEFAULT 0,
        tier_level TEXT NOT NULL DEFAULT 'Bronze'
      );

      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        team_a TEXT NOT NULL,
        team_b TEXT NOT NULL,
        match_time INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'upcoming',
        actual_result TEXT,
        team_a_logo TEXT,
        team_b_logo TEXT,
        live_score_text TEXT
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        match_id TEXT NOT NULL,
        predicted_result TEXT NOT NULL,
        wager_amount INTEGER NOT NULL,
        points_awarded INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(match_id) REFERENCES matches(id)
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        details TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

    console.log("Seeding mock data...");
    
    const insertUser = sqlite.prepare('INSERT INTO users (id, username, total_points, current_streak, tier_level) VALUES (?, ?, ?, ?, ?)');
    insertUser.run('u1', 'Alex_Predictr', 450, 2, 'Silver');
    insertUser.run('u2', 'BetMaser99', 1200, 5, 'Gold');
    insertUser.run('u3', 'SportsFan1', 150, 0, 'Bronze');

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const insertMatch = sqlite.prepare('INSERT INTO matches (id, team_a, team_b, match_time, status, team_a_logo, team_b_logo) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    insertMatch.run(
      'm1', 
      'RCB', 
      'KKR', 
      now - oneHour, 
      'live', 
      'https://ui-avatars.com/api/?name=RCB&background=random&color=fff', 
      'https://ui-avatars.com/api/?name=KKR&background=random&color=fff'
    );
    insertMatch.run(
      'm2', 
      'CSK', 
      'MI', 
      now + oneHour * 24, 
      'upcoming', 
      'https://ui-avatars.com/api/?name=CSK&background=random&color=fff', 
      'https://ui-avatars.com/api/?name=MI&background=random&color=fff'
    );
    insertMatch.run(
      'm3', 
      'SRH', 
      'RR', 
      now + oneHour * 48, 
      'upcoming', 
      'https://ui-avatars.com/api/?name=SRH&background=random&color=fff', 
      'https://ui-avatars.com/api/?name=RR&background=random&color=fff'
    );
    
    console.log("Database initialized successfully!");
  }
}

initDB();
