-- This is an empty migration.

ALTER TABLE `members`
ADD COLUMN `npm` VARCHAR(10) AFTER `name`,
MODIFY COLUMN `ktm_image` VARCHAR(255) NOT NULL AFTER `major`,
MODIFY COLUMN `bio` TEXT NULL AFTER `address`;