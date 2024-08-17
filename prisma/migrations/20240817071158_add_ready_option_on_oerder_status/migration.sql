-- AlterTable
ALTER TABLE `orders` MODIFY `order_status` ENUM('pending', 'processed', 'ready', 'rejected', 'canceled', 'completed') NOT NULL DEFAULT 'pending';
