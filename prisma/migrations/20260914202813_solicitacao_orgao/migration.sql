-- CreateTable
CREATE TABLE `SolicitacaoOrgao` (
    `id` VARCHAR(191) NOT NULL,
    `nomeOrgao` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NULL,
    `cidadeId` VARCHAR(191) NOT NULL,
    `nomeResponsavel` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE',
    `motivoRejeicao` TEXT NULL,
    `analisadoPorId` VARCHAR(191) NULL,
    `analisadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SolicitacaoOrgao_cidadeId_idx`(`cidadeId`),
    INDEX `SolicitacaoOrgao_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SolicitacaoOrgao` ADD CONSTRAINT `SolicitacaoOrgao_cidadeId_fkey` FOREIGN KEY (`cidadeId`) REFERENCES `Cidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitacaoOrgao` ADD CONSTRAINT `SolicitacaoOrgao_analisadoPorId_fkey` FOREIGN KEY (`analisadoPorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
