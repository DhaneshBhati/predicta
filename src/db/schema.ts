import {
  sqliteTable,
  text,
  integer,
  real
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  totalPoints: integer('total_points').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  highestStreak: integer('highest_streak').notNull().default(0),
  tierLevel: text('tier_level').notNull().default('Bronze'), // Bronze, Silver, Gold, Platinum
});

export const matches = sqliteTable('matches', {
  id: text('id').primaryKey(),
  teamA: text('team_a').notNull(),
  teamB: text('team_b').notNull(),
  matchTime: integer('match_time', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('upcoming'), // upcoming, live, finished
  actualResult: text('actual_result'), // teamA, teamB, draw
  teamALogo: text('team_a_logo'),
  teamBLogo: text('team_b_logo'),
  liveScoreText: text('live_score_text'),
});

export const predictions = sqliteTable('predictions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  matchId: text('match_id').notNull().references(() => matches.id),
  predictedResult: text('predicted_result').notNull(), // teamA, teamB, draw
  wagerAmount: integer('wager_amount').notNull(),
  pointsAwarded: integer('points_awarded').default(0),
  status: text('status').notNull().default('pending'), // pending, correct, incorrect
});

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  actionType: text('action_type').notNull(), // login, prediction, share
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  details: text('details'), // JSON string for extra context
});
