/*
  Warnings:

  - You are about to drop the column `delivery_method_id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method_id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `order_products` table. All the data in the column will be lost.
  - Added the required column `image` to the `order_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `order_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `order_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_delivery_method_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_payment_method_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_products` DROP FOREIGN KEY `order_products_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_products` DROP FOREIGN KEY `order_products_product_id_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `delivery_method_id`,
    DROP COLUMN `payment_method_id`,
    DROP COLUMN `status`,
    ADD COLUMN `order_status` ENUM('pending', 'accepted', 'rejected', 'canceled', 'completed') NOT NULL DEFAULT 'pending',
    ADD COLUMN `payment_status` ENUM('checking', 'paid', 'unpaid') NOT NULL DEFAULT 'checking',
    MODIFY `payment_image` TEXT NULL;

-- AlterTable
ALTER TABLE `order_products` DROP COLUMN `product_id`,
    ADD COLUMN `image` VARCHAR(255) NOT NULL,
    ADD COLUMN `name` VARCHAR(255) NOT NULL,
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL;

-- CreateTable
CREATE TABLE `order_payment_methods` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(255) NOT NULL,
    `provider` VARCHAR(255) NOT NULL,
    `no_account` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `order_payment_methods_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_delivery_methods` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(255) NOT NULL,
    `method` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `order_delivery_methods_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_products` ADD CONSTRAINT `order_products_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_payment_methods` ADD CONSTRAINT `order_payment_methods_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_delivery_methods` ADD CONSTRAINT `order_delivery_methods_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
