ALTER TABLE `divination_tools` ADD `locale` text DEFAULT 'en' NOT NULL;
UPDATE `divination_tools` SET `locale` = 'en' WHERE `locale` IS NULL;
