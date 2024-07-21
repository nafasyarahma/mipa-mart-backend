/*
  Warnings:

  - Added the required column `order_id` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Made the column `comment` on table `reviews` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `reviews` ADD COLUMN `order_id` VARCHAR(255) NOT NULL,
    MODIFY `comment` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
