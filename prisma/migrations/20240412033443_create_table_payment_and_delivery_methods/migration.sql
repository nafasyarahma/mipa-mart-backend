-- CreateTable
CREATE TABLE `payment_methods` (
    `id` VARCHAR(255) NOT NULL,
    `provider` VARCHAR(255) NOT NULL,
    `no_account` VARCHAR(255) NOT NULL,
    `member_id` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_methods` (
    `id` VARCHAR(255) NOT NULL,
    `method` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `member_id` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_methods` ADD CONSTRAINT `delivery_methods_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
