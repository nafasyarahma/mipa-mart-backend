-- CreateTable
CREATE TABLE `Authentications` (
    `id` VARCHAR(191) NOT NULL,
    `token` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
