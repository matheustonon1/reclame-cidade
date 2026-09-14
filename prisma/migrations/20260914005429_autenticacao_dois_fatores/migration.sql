-- AlterTable
ALTER TABLE `User` ADD COLUMN `totpBloqueadoAte` DATETIME(3) NULL,
    ADD COLUMN `totpConfirmadoEm` DATETIME(3) NULL,
    ADD COLUMN `totpSecret` VARCHAR(191) NULL,
    ADD COLUMN `totpTentativasFalhas` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `TotpBackupCode` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `codigoHash` VARCHAR(191) NOT NULL,
    `usadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TotpBackupCode_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TotpBackupCode` ADD CONSTRAINT `TotpBackupCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
