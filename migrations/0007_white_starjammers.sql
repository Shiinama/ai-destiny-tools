ALTER TABLE `divination_tools` ADD `order` integer DEFAULT 0;

UPDATE divination_tools SET `order` = 0;
