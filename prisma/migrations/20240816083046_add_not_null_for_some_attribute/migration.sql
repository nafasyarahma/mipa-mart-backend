-- AlterTable
ALTER TABLE `payment_methods` MODIFY `no_account` VARCHAR(255) NULL,
    MODIFY `name` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `reviews` MODIFY `comment` TEXT NULL;
