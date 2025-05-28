import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'crypto'
import { sql } from 'drizzle-orm'

const id = () =>
  text('id')
    .primaryKey()
    .$default(() => randomUUID())

const createdAt = () =>
  text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()

export const users = sqliteTable('users', {
  id: id(),
  username: text('username').notNull().unique(),
  level: integer('level').notNull().default(1),
  coins: integer('coins').notNull().default(500),
  gems: integer('gems').notNull().default(50),
  battlesWon: integer('battles_won').notNull().default(0),
  winStreak: integer('win_streak').notNull().default(0),
  experience: integer('experience').notNull().default(0),
  email: text().unique(),
  createdAt: createdAt(),
  updatedAt: createdAt(),
})

export const cats = sqliteTable('cats', {
  id: id(),
  name: text('name').notNull(),
  rarity: text('rarity').notNull(), // common, rare, epic, legendary
  baseAttack: integer('base_attack').notNull(),
  baseHealth: integer('base_health').notNull(),
  baseDefense: integer('base_defense').notNull(),
  baseSpeed: integer('base_speed').notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
  specialAbility: text('special_ability'),
  createdAt: createdAt(),
  updatedAt: createdAt(),
})

export const userCats = sqliteTable('user_cats', {
  id: id(),
  userId: text('user_id').notNull(),
  catId: text('cat_id').notNull(),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  currentHealth: integer('current_health').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: createdAt(),
})

export const userProfile = sqliteTable('user_profile', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: createdAt(),
  updatedAt: createdAt(),
})

export const battles = sqliteTable('battles', {
  id: id(),
  userId: text('user_id').notNull(),
  playerCatId: text('player_cat_id').notNull(),
  opponentCatId: text('opponent_cat_id').notNull(),
  status: text('status').notNull(), // active, won, lost
  turn: integer('turn').notNull().default(1),
  round: integer('round').notNull().default(1),
  playerHealth: integer('player_health').notNull(),
  opponentHealth: integer('opponent_health').notNull(),
  coinsReward: integer('coins_reward'),
  experienceReward: integer('experience_reward'),
  createdAt: createdAt(),
  updatedAt: createdAt(),
})

export const battleLogs = sqliteTable('battle_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  battleId: text('battle_id')
    .notNull()
    .references(() => battles.id, { onDelete: 'cascade' }),
  log: text('log').notNull(),
  createdAt: createdAt(),
})

export const items = sqliteTable('items', {
  id: id(),
  name: text('name').notNull(),
  type: text('type').notNull(), // potion, upgrade, boost
  effect: text('effect').notNull(),
  value: integer('value').notNull(),
  cost: integer('cost').notNull(),
  description: text('description'),
  createdAt: createdAt(),
  updatedAt: createdAt(),
})

export const userItems = sqliteTable('user_items', {
  id: id(),
  userId: text('user_id').notNull(),
  itemId: text('item_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: createdAt(),
  updatedAt: createdAt(),
})

export type InsertUser = typeof users.$inferInsert
export type User = typeof users.$inferSelect

export type InsertCat = typeof cats.$inferInsert
export type Cat = typeof cats.$inferSelect

export type InsertUserCat = typeof userCats.$inferInsert
export type UserCat = typeof userCats.$inferSelect

export type InsertBattle = typeof battles.$inferInsert
export type Battle = typeof battles.$inferSelect

export type InsertBattleLog = typeof battleLogs.$inferInsert
export type BattleLog = typeof battleLogs.$inferSelect

export type InsertItem = typeof items.$inferInsert
export type Item = typeof items.$inferSelect

export type InsertUserItem = typeof userItems.$inferInsert
export type UserItem = typeof userItems.$inferSelect

// Extended types for API responses
export type UserCatWithDetails = UserCat & {
  cat: Cat
  maxHealth: number
  attack: number
  defense: number
  speed: number
}

export type BattleWithDetails = Battle & {
  playerCat: UserCatWithDetails
  opponentCat: Cat
}
