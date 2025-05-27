import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  level: integer("level").notNull().default(1),
  coins: integer("coins").notNull().default(500),
  gems: integer("gems").notNull().default(50),
  battlesWon: integer("battles_won").notNull().default(0),
  winStreak: integer("win_streak").notNull().default(0),
  experience: integer("experience").notNull().default(0),
});

export const cats = pgTable("cats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rarity: text("rarity").notNull(), // common, rare, epic, legendary
  baseAttack: integer("base_attack").notNull(),
  baseHealth: integer("base_health").notNull(),
  baseDefense: integer("base_defense").notNull(),
  baseSpeed: integer("base_speed").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  specialAbility: text("special_ability"),
});

export const userCats = pgTable("user_cats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  catId: integer("cat_id").notNull(),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  currentHealth: integer("current_health").notNull(),
  isActive: boolean("is_active").notNull().default(false),
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  playerCatId: integer("player_cat_id").notNull(),
  opponentCatId: integer("opponent_cat_id").notNull(),
  status: text("status").notNull(), // active, won, lost
  turn: integer("turn").notNull().default(1),
  round: integer("round").notNull().default(1),
  playerHealth: integer("player_health").notNull(),
  opponentHealth: integer("opponent_health").notNull(),
  battleLog: jsonb("battle_log").notNull().default([]),
  coinsReward: integer("coins_reward"),
  experienceReward: integer("experience_reward"),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // potion, upgrade, boost
  effect: text("effect").notNull(),
  value: integer("value").notNull(),
  cost: integer("cost").notNull(),
  description: text("description"),
});

export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCatSchema = createInsertSchema(cats).omit({
  id: true,
});

export const insertUserCatSchema = createInsertSchema(userCats).omit({
  id: true,
});

export const insertBattleSchema = createInsertSchema(battles).omit({
  id: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export const insertUserItemSchema = createInsertSchema(userItems).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCat = z.infer<typeof insertCatSchema>;
export type Cat = typeof cats.$inferSelect;

export type InsertUserCat = z.infer<typeof insertUserCatSchema>;
export type UserCat = typeof userCats.$inferSelect;

export type InsertBattle = z.infer<typeof insertBattleSchema>;
export type Battle = typeof battles.$inferSelect;

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

export type InsertUserItem = z.infer<typeof insertUserItemSchema>;
export type UserItem = typeof userItems.$inferSelect;

// Extended types for API responses
export type UserCatWithDetails = UserCat & {
  cat: Cat;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
};

export type BattleWithDetails = Battle & {
  playerCat: UserCatWithDetails;
  opponentCat: Cat;
};
