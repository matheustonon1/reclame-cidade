-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `senhaHash` VARCHAR(191) NULL,
    `cpfHash` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `papel` ENUM('CIDADAO', 'MODERADOR', 'ORGAO', 'ADMIN') NOT NULL DEFAULT 'CIDADAO',
    `nivelVerificacao` ENUM('NAO_VERIFICADO', 'EMAIL', 'DOCUMENTO') NOT NULL DEFAULT 'NAO_VERIFICADO',
    `cidadeId` VARCHAR(191) NULL,
    `bairroId` VARCHAR(191) NULL,
    `orgaoId` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `banidoAte` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_cpfHash_key`(`cpfHash`),
    INDEX `User_cidadeId_idx`(`cidadeId`),
    INDEX `User_papel_idx`(`papel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estado` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `uf` VARCHAR(2) NOT NULL,

    UNIQUE INDEX `Estado_uf_key`(`uf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cidade` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `codigoIbge` VARCHAR(191) NOT NULL,
    `estadoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Cidade_slug_key`(`slug`),
    UNIQUE INDEX `Cidade_codigoIbge_key`(`codigoIbge`),
    INDEX `Cidade_estadoId_idx`(`estadoId`),
    INDEX `Cidade_nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bairro` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cidadeId` VARCHAR(191) NOT NULL,

    INDEX `Bairro_cidadeId_idx`(`cidadeId`),
    UNIQUE INDEX `Bairro_cidadeId_nome_key`(`cidadeId`, `nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `icone` VARCHAR(191) NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Categoria_nome_key`(`nome`),
    UNIQUE INDEX `Categoria_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Orgao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `cidadeId` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Orgao_cidadeId_idx`(`cidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reclamacao` (
    `id` VARCHAR(191) NOT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(180) NOT NULL,
    `descricao` TEXT NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `anonima` BOOLEAN NOT NULL DEFAULT false,
    `cidadeId` VARCHAR(191) NOT NULL,
    `bairroId` VARCHAR(191) NULL,
    `endereco` VARCHAR(255) NOT NULL,
    `referencia` VARCHAR(255) NULL,
    `cep` VARCHAR(9) NULL,
    `categoriaId` VARCHAR(191) NOT NULL,
    `status` ENUM('RASCUNHO', 'EM_MODERACAO', 'AGUARDANDO_REVISAO', 'PUBLICADA', 'REJEITADA', 'EM_ANDAMENTO', 'RESOLVIDA', 'ARQUIVADA') NOT NULL DEFAULT 'EM_MODERACAO',
    `scoreModeracao` DOUBLE NULL,
    `motivoRejeicao` TEXT NULL,
    `emRecurso` BOOLEAN NOT NULL DEFAULT false,
    `visualizacoes` INTEGER NOT NULL DEFAULT 0,
    `publicadaEm` DATETIME(3) NULL,
    `resolvidaEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Reclamacao_protocolo_key`(`protocolo`),
    INDEX `Reclamacao_cidadeId_status_idx`(`cidadeId`, `status`),
    INDEX `Reclamacao_categoriaId_idx`(`categoriaId`),
    INDEX `Reclamacao_autorId_idx`(`autorId`),
    INDEX `Reclamacao_status_publicadaEm_idx`(`status`, `publicadaEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Midia` (
    `id` VARCHAR(191) NOT NULL,
    `reclamacaoId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `urlTratada` VARCHAR(500) NULL,
    `tipo` ENUM('IMAGEM', 'DOCUMENTO') NOT NULL DEFAULT 'IMAGEM',
    `nomeArquivo` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `tamanhoBytes` INTEGER NOT NULL,
    `larguraPx` INTEGER NULL,
    `alturaPx` INTEGER NULL,
    `phash` VARCHAR(64) NULL,
    `exifJson` TEXT NULL,
    `capturadaEm` DATETIME(3) NULL,
    `statusModeracao` ENUM('PENDENTE', 'APROVADO', 'REPROVADO', 'REVISAO_HUMANA') NOT NULL DEFAULT 'PENDENTE',
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Midia_reclamacaoId_idx`(`reclamacaoId`),
    INDEX `Midia_phash_idx`(`phash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogModeracao` (
    `id` VARCHAR(191) NOT NULL,
    `alvoTipo` ENUM('RECLAMACAO', 'MIDIA', 'COMENTARIO') NOT NULL,
    `alvoId` VARCHAR(191) NOT NULL,
    `provedor` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `versaoPrompt` VARCHAR(32) NOT NULL,
    `decisao` ENUM('APROVAR', 'REPROVAR', 'ENCAMINHAR_REVISAO') NOT NULL,
    `scoreGeral` DOUBLE NOT NULL,
    `scoreOfensivo` DOUBLE NULL,
    `scoreSpam` DOUBLE NULL,
    `scoreDadosPessoais` DOUBLE NULL,
    `scoreForaEscopo` DOUBLE NULL,
    `scoreDesinformacao` DOUBLE NULL,
    `coerenciaTextoImagem` DOUBLE NULL,
    `justificativa` TEXT NULL,
    `resultadoJson` TEXT NOT NULL,
    `latenciaMs` INTEGER NULL,
    `tokensEntrada` INTEGER NULL,
    `tokensSaida` INTEGER NULL,
    `revisadoPorId` VARCHAR(191) NULL,
    `decisaoFinal` ENUM('APROVAR', 'REPROVAR', 'ENCAMINHAR_REVISAO') NULL,
    `revisadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LogModeracao_alvoTipo_alvoId_idx`(`alvoTipo`, `alvoId`),
    INDEX `LogModeracao_decisao_idx`(`decisao`),
    INDEX `LogModeracao_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comentario` (
    `id` VARCHAR(191) NOT NULL,
    `reclamacaoId` VARCHAR(191) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `paiId` VARCHAR(191) NULL,
    `statusModeracao` ENUM('PENDENTE', 'APROVADO', 'REPROVADO', 'REVISAO_HUMANA') NOT NULL DEFAULT 'PENDENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Comentario_reclamacaoId_idx`(`reclamacaoId`),
    INDEX `Comentario_autorId_idx`(`autorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Confirmacao` (
    `userId` VARCHAR(191) NOT NULL,
    `reclamacaoId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Confirmacao_reclamacaoId_idx`(`reclamacaoId`),
    PRIMARY KEY (`userId`, `reclamacaoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespostaOficial` (
    `id` VARCHAR(191) NOT NULL,
    `reclamacaoId` VARCHAR(191) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `orgaoId` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `novoStatus` ENUM('RASCUNHO', 'EM_MODERACAO', 'AGUARDANDO_REVISAO', 'PUBLICADA', 'REJEITADA', 'EM_ANDAMENTO', 'RESOLVIDA', 'ARQUIVADA') NULL,
    `prazoEstimado` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RespostaOficial_reclamacaoId_idx`(`reclamacaoId`),
    INDEX `RespostaOficial_orgaoId_idx`(`orgaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Avaliacao` (
    `id` VARCHAR(191) NOT NULL,
    `reclamacaoId` VARCHAR(191) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `nota` INTEGER NOT NULL,
    `resolvido` BOOLEAN NOT NULL,
    `comentario` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Avaliacao_reclamacaoId_key`(`reclamacaoId`),
    INDEX `Avaliacao_autorId_idx`(`autorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Denuncia` (
    `id` VARCHAR(191) NOT NULL,
    `alvoTipo` ENUM('RECLAMACAO', 'MIDIA', 'COMENTARIO') NOT NULL,
    `alvoId` VARCHAR(191) NOT NULL,
    `denuncianteId` VARCHAR(191) NOT NULL,
    `motivo` ENUM('OFENSIVO', 'SPAM', 'DESINFORMACAO', 'FORA_DE_ESCOPO', 'DADOS_PESSOAIS', 'DUPLICADA', 'OUTRO') NOT NULL,
    `descricao` TEXT NULL,
    `status` ENUM('ABERTA', 'PROCEDENTE', 'IMPROCEDENTE') NOT NULL DEFAULT 'ABERTA',
    `analisadoPorId` VARCHAR(191) NULL,
    `analisadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Denuncia_alvoTipo_alvoId_idx`(`alvoTipo`, `alvoId`),
    INDEX `Denuncia_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacao` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('RECLAMACAO_PUBLICADA', 'RECLAMACAO_REJEITADA', 'RESPOSTA_OFICIAL', 'MUDANCA_STATUS', 'NOVO_COMENTARIO', 'PEDIDO_AVALIACAO') NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `reclamacaoId` VARCHAR(191) NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacao_userId_lida_idx`(`userId`, `lida`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_cidadeId_fkey` FOREIGN KEY (`cidadeId`) REFERENCES `Cidade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_bairroId_fkey` FOREIGN KEY (`bairroId`) REFERENCES `Bairro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_orgaoId_fkey` FOREIGN KEY (`orgaoId`) REFERENCES `Orgao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cidade` ADD CONSTRAINT `Cidade_estadoId_fkey` FOREIGN KEY (`estadoId`) REFERENCES `Estado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bairro` ADD CONSTRAINT `Bairro_cidadeId_fkey` FOREIGN KEY (`cidadeId`) REFERENCES `Cidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orgao` ADD CONSTRAINT `Orgao_cidadeId_fkey` FOREIGN KEY (`cidadeId`) REFERENCES `Cidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclamacao` ADD CONSTRAINT `Reclamacao_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclamacao` ADD CONSTRAINT `Reclamacao_cidadeId_fkey` FOREIGN KEY (`cidadeId`) REFERENCES `Cidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclamacao` ADD CONSTRAINT `Reclamacao_bairroId_fkey` FOREIGN KEY (`bairroId`) REFERENCES `Bairro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclamacao` ADD CONSTRAINT `Reclamacao_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Midia` ADD CONSTRAINT `Midia_reclamacaoId_fkey` FOREIGN KEY (`reclamacaoId`) REFERENCES `Reclamacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogModeracao` ADD CONSTRAINT `LogModeracao_revisadoPorId_fkey` FOREIGN KEY (`revisadoPorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentario` ADD CONSTRAINT `Comentario_reclamacaoId_fkey` FOREIGN KEY (`reclamacaoId`) REFERENCES `Reclamacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentario` ADD CONSTRAINT `Comentario_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentario` ADD CONSTRAINT `Comentario_paiId_fkey` FOREIGN KEY (`paiId`) REFERENCES `Comentario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Confirmacao` ADD CONSTRAINT `Confirmacao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Confirmacao` ADD CONSTRAINT `Confirmacao_reclamacaoId_fkey` FOREIGN KEY (`reclamacaoId`) REFERENCES `Reclamacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespostaOficial` ADD CONSTRAINT `RespostaOficial_reclamacaoId_fkey` FOREIGN KEY (`reclamacaoId`) REFERENCES `Reclamacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespostaOficial` ADD CONSTRAINT `RespostaOficial_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespostaOficial` ADD CONSTRAINT `RespostaOficial_orgaoId_fkey` FOREIGN KEY (`orgaoId`) REFERENCES `Orgao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avaliacao` ADD CONSTRAINT `Avaliacao_reclamacaoId_fkey` FOREIGN KEY (`reclamacaoId`) REFERENCES `Reclamacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avaliacao` ADD CONSTRAINT `Avaliacao_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_denuncianteId_fkey` FOREIGN KEY (`denuncianteId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_analisadoPorId_fkey` FOREIGN KEY (`analisadoPorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_reclamacaoId_fkey` FOREIGN KEY (`reclamacaoId`) REFERENCES `Reclamacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
