ALTER TABLE `game_records` RENAME TO `battle_logs`;--> statement-breakpoint
ALTER TABLE `battle_logs` RENAME COLUMN "user_id" TO "battle_id";--> statement-breakpoint
ALTER TABLE `battle_logs` RENAME COLUMN "score" TO "log";--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN "player_name" TO "username";--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN "ethereum_address" TO "level";--> statement-breakpoint
CREATE TABLE `battles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`player_cat_id` text NOT NULL,
	`opponent_cat_id` text NOT NULL,
	`status` text NOT NULL,
	`turn` integer DEFAULT 1 NOT NULL,
	`round` integer DEFAULT 1 NOT NULL,
	`player_health` integer NOT NULL,
	`opponent_health` integer NOT NULL,
	`coins_reward` integer,
	`experience_reward` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cats` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rarity` text NOT NULL,
	`base_attack` integer NOT NULL,
	`base_health` integer NOT NULL,
	`base_defense` integer NOT NULL,
	`base_speed` integer NOT NULL,
	`image_url` text NOT NULL,
	`description` text,
	`special_ability` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`effect` text NOT NULL,
	`value` integer NOT NULL,
	`cost` integer NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_cats` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cat_id` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`experience` integer DEFAULT 0 NOT NULL,
	`current_health` integer NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_battle_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`battle_id` text NOT NULL,
	`log` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`battle_id`) REFERENCES `battles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_battle_logs`("id", "battle_id", "log", "created_at") SELECT "id", "battle_id", "log", "created_at" FROM `battle_logs`;--> statement-breakpoint
DROP TABLE `battle_logs`;--> statement-breakpoint
ALTER TABLE `__new_battle_logs` RENAME TO `battle_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX `users_ethereum_address_unique`;--> statement-breakpoint
DROP INDEX "user_profile_user_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_username_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "level" TO "level" integer NOT NULL DEFAULT 1;--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_user_id_unique` ON `user_profile` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "username" TO "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `coins` integer DEFAULT 500 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `gems` integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `battles_won` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `win_streak` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `experience` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE `__new_user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_profile`("id", "user_id", "bio", "avatar_url", "created_at") SELECT "id", "user_id", "bio", "avatar_url", "created_at" FROM `user_profile`;--> statement-breakpoint
DROP TABLE `user_profile`;--> statement-breakpoint
ALTER TABLE `__new_user_profile` RENAME TO `user_profile`;