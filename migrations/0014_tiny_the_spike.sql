CREATE TABLE `tool_analytics_summary` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_id` text NOT NULL,
	`total_visits` integer DEFAULT 0 NOT NULL,
	`unique_visitors` integer DEFAULT 0 NOT NULL,
	`last_synced_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `divination_tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `tool_analytics` ADD `is_synced` integer DEFAULT false NOT NULL;