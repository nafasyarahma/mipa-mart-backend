/*
  Warnings:

  - Added the required column `ktm_image` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `members` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `ktm_image` VARCHAR(255) NOT NULL;
