CREATE TABLE `divination_categories` (
    `id` text PRIMARY KEY NOT NULL,
    `key` text NOT NULL,
    `order` integer DEFAULT 0,
    `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `divination_categories_key_unique` ON `divination_categories` (`key`);--> statement-breakpoint
CREATE TABLE `divination_tools` (
    `id` text PRIMARY KEY NOT NULL,
    `userId` text NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `url` text NOT NULL,
    `image_url` text,
    `category_id` text NOT NULL,
    `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (`category_id`) REFERENCES `divination_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `ai_categories`;--> statement-breakpoint
DROP TABLE `ai_sites`;--> statement-breakpoint

-- Insert predefined divination categories
INSERT INTO `divination_categories` (`id`, `key`, `order`, `created_at`) VALUES
(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))), 'tarot', 1, CURRENT_TIMESTAMP),
(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))), 'astrology', 2, CURRENT_TIMESTAMP),
(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))), 'vedic', 3, CURRENT_TIMESTAMP),
(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))), 'iChing', 4, CURRENT_TIMESTAMP),
(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))), 'numerology', 5, CURRENT_TIMESTAMP),
(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))), 'palmistry', 6, CURRENT_TIMESTAMP),
(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))), 'dreamInterpretation', 7, CURRENT_TIMESTAMP);