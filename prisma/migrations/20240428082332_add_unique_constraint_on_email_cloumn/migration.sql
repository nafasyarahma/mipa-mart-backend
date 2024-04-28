/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `customers_email_key` ON `customers`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `members_email_key` ON `members`(`email`);
