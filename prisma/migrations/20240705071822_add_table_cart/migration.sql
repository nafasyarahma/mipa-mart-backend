/*
  Warnings:

  - You are about to drop the column `customer_id` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[npm]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cart_id` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cart_items` DROP FOREIGN KEY `cart_items_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_delivery_methods` DROP FOREIGN KEY `order_delivery_methods_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_payment_methods` DROP FOREIGN KEY `order_payment_methods_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_products` DROP FOREIGN KEY `order_products_order_id_fkey`;

-- AlterTable
ALTER TABLE `cart_items` DROP COLUMN `customer_id`,
    ADD COLUMN `cart_id` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `order`;

-- CreateTable
CREATE TABLE `carts` (
    `id` VARCHAR(255) NOT NULL,
    `customer_id` VARCHAR(255) NOT NULL,
    `member_id` VARCHAR(255) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(255) NOT NULL,
    `customer_id` VARCHAR(255) NOT NULL,
    `member_id` VARCHAR(255) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `note` TEXT NULL,
    `payment_image` TEXT NULL,
    `order_status` ENUM('pending', 'processed', 'rejected', 'canceled', 'completed') NOT NULL DEFAULT 'pending',
    `payment_status` ENUM('checking', 'paid', 'unpaid') NOT NULL DEFAULT 'checking',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `members_npm_key` ON `members`(`npm`);

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_products` ADD CONSTRAINT `order_products_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_payment_methods` ADD CONSTRAINT `order_payment_methods_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_delivery_methods` ADD CONSTRAINT `order_delivery_methods_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
