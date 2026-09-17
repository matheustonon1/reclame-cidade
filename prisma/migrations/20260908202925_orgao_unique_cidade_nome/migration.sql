/*
  Warnings:

  - A unique constraint covering the columns `[cidadeId,nome]` on the table `Orgao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Orgao_cidadeId_nome_key` ON `Orgao`(`cidadeId`, `nome`);
