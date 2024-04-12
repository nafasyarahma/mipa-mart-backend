/*
  Warnings:

  - Added the required column `name` to the `payment_methods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment_methods` ADD COLUMN `name` VARCHAR(255) NOT NULL;
