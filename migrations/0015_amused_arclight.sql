CREATE TABLE `divination_tool_translations` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_id` text NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `divination_tools`(`id`) ON UPDATE no action ON DELETE cascade
);
