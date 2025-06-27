CREATE TABLE `tool_analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_id` text,
	`user_id` text,
	`ip_address` text,
	`user_agent` text,
	`device_type` text,
	`operating_system` text,
	`browser` text,
	`referrer` text,
	`referrer_domain` text,
	`language` text,
	`visited_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`session_id` text,
	FOREIGN KEY (`tool_id`) REFERENCES `divination_tools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
