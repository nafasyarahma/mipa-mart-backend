/*
  Warnings:

  - Made the column `npm` on table `members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `members` MODIFY `npm` VARCHAR(10) NOT NULL;
