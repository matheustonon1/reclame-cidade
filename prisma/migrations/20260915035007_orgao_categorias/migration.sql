-- CreateTable
CREATE TABLE `_CategoriaToOrgao` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CategoriaToOrgao_AB_unique`(`A`, `B`),
    INDEX `_CategoriaToOrgao_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CategoriaToOrgao` ADD CONSTRAINT `_CategoriaToOrgao_A_fkey` FOREIGN KEY (`A`) REFERENCES `Categoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToOrgao` ADD CONSTRAINT `_CategoriaToOrgao_B_fkey` FOREIGN KEY (`B`) REFERENCES `Orgao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
