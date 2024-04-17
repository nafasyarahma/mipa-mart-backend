/*
  Warnings:

  - The primary key for the `order_products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `order_products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `delivery_methods` MODIFY `description` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('pending', 'accepted', 'rejected', 'canceled', 'completed') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `order_products` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
