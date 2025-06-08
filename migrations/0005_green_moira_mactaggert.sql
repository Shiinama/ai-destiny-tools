ALTER TABLE `divination_tools` ADD `contact_info` text;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `content` text;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `platform` text;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `is_free` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `price` text;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `logo_url` text;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `divination_tools` ADD `screenshot_urls` text;

UPDATE divination_tools SET status = 'approved' WHERE status IS NULL OR status = 'pending';
