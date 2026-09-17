-- AlterTable
ALTER TABLE `User` ADD COLUMN `loginBloqueadoAte` DATETIME(3) NULL,
    ADD COLUMN `loginTentativasFalhas` INTEGER NOT NULL DEFAULT 0;
