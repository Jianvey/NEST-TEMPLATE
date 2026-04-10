-- CreateTable
CREATE TABLE `User` (
    `userId` BIGINT NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `username` VARCHAR(11) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL DEFAULT '/avatar.png',
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_username_idx`(`username`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_createdAt_idx`(`createdAt`),
    INDEX `User_role_createdAt_idx`(`role`, `createdAt`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
