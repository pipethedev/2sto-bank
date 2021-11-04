-- CreateTable
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191),
    `lastname` VARCHAR(191),
    `role` ENUM('SUPER', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_users.uid_unique`(`uid`),
    UNIQUE INDEX `admin_users.username_unique`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191),
    `lastname` VARCHAR(191),
    `username` VARCHAR(191),
    `phone` VARCHAR(191),
    `email` VARCHAR(191),
    `image` VARCHAR(191) NOT NULL DEFAULT 'none',
    `notifiable` BOOLEAN NOT NULL DEFAULT false,
    `pin` VARCHAR(191),
    `deviceId` VARCHAR(191),
    `notification_token` VARCHAR(191),
    `bio` VARCHAR(191),
    `address` VARCHAR(191),
    `otp` VARCHAR(191),
    `otp_verified` BOOLEAN NOT NULL DEFAULT false,
    `email_verified_at` DATETIME(3),
    `password` VARCHAR(191),
    `bvn` VARCHAR(191),
    `kyc` VARCHAR(191),
    `qrcode` LONGTEXT,
    `type` ENUM('NIN', 'BVN') NOT NULL,
    `auth` ENUM('PASSWORD', 'FINGERPRINT', 'FACEID'),
    `role` ENUM('MEMBER', 'ADMIN') NOT NULL DEFAULT 'MEMBER',
    `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `accountVerifyToken` VARCHAR(191),
    `accountVerifyExpires` DATETIME(3),
    `passwordChangedAt` DATETIME(3),
    `passwordResetToken` VARCHAR(191),
    `passwordResetExpires` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users.uid_unique`(`uid`),
    UNIQUE INDEX `users.username_unique`(`username`),
    UNIQUE INDEX `users.email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'NOT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `kins.uid_unique`(`uid`),
    UNIQUE INDEX `kins_user_id_unique`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `balance` INTEGER DEFAULT 0,
    `account` VARCHAR(191),
    `account_code` VARCHAR(191),
    `reference` VARCHAR(191),
    `visibility` BOOLEAN DEFAULT true,
    `currency` ENUM('NGN', 'USD', 'EUR', 'GBP') NOT NULL DEFAULT 'NGN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `accounts.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `business_id` VARCHAR(191) NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `type` ENUM('UTILITY', 'LISCENSE', 'PERSONAL') NOT NULL,

    UNIQUE INDEX `documents.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `beneficiaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191),
    `name` VARCHAR(191),
    `account_number` VARCHAR(191),
    `account_bank` VARCHAR(191),
    `recipient_id` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `beneficiaries.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `account_id` VARCHAR(191) DEFAULT 'none',
    `name` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191),
    `spent` INTEGER DEFAULT 0,
    `limit` INTEGER,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `plans.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `budget_id` VARCHAR(191),
    `account_id` VARCHAR(191),
    `user_id` VARCHAR(191) NOT NULL,
    `recipient_id` VARCHAR(191),
    `summary` VARCHAR(191) NOT NULL,
    `analytics` BOOLEAN NOT NULL DEFAULT false,
    `amount` INTEGER NOT NULL,
    `alert_type` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `type` ENUM('P2P', 'TRANSFER', 'CARD', 'QRCODE') NOT NULL,
    `merchant` ENUM('MTN', 'AIRTEL', 'GLO', 'MOBILE', 'DSTV', 'GOTV', 'STARTIMES', 'SMILE', 'SPECTRANT', 'IKEC'),
    `narration` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `transactions.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `card_fund_id` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `card_pan` VARCHAR(191) NOT NULL,
    `masked_pan` VARCHAR(191) NOT NULL,
    `expiry` VARCHAR(191) NOT NULL,
    `cvv` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `billing_address` VARCHAR(191) NOT NULL,
    `limit` INTEGER,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `virtual_cards.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `pan_number` VARCHAR(191) NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,
    `last4` VARCHAR(191) NOT NULL,
    `expiry` VARCHAR(191) NOT NULL,
    `type` ENUM('MASTERCARD', 'VISA', 'VERVE', 'AMERICA_EXPRESS') NOT NULL DEFAULT 'MASTERCARD',
    `active` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `cards.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `type` ENUM('ALERT', 'INFO', 'UPDATE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `messages.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `narration` VARCHAR(191),
    `token` VARCHAR(191) NOT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `links.uid_unique`(`uid`),
    UNIQUE INDEX `links.token_unique`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `business_type` ENUM('LLC', 'PLC', 'NGO', 'PARTNERSHIP', 'SOLE') NOT NULL,
    `industry` VARCHAR(191) NOT NULL,
    `pin` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `flat` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `business.uid_unique`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kins` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD FOREIGN KEY (`business_id`) REFERENCES `business`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `beneficiaries` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans` ADD FOREIGN KEY (`account_id`) REFERENCES `accounts`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD FOREIGN KEY (`account_id`) REFERENCES `accounts`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD FOREIGN KEY (`budget_id`) REFERENCES `plans`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_cards` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cards` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `links` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;
