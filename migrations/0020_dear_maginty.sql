CREATE TABLE `tool_similarweb_data` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_id` text NOT NULL,
	`similarweb_data` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `divination_tools`(`id`) ON UPDATE no action ON DELETE cascade
);
