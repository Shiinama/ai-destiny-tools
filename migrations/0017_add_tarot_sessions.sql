CREATE TABLE `tarot_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`question` text NOT NULL,
	`spread_name` text NOT NULL,
	`spread_category` text NOT NULL,
	`spread_desc` text,
	`reason` text,
	`card_count` integer NOT NULL,
	`spread_link` text,
	`cards` text,
	`ai_interpretation` text,
	`status` text DEFAULT 'created' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
