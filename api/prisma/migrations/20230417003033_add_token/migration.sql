/*
  Warnings:

  - A unique constraint covering the columns `[accessToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refreshToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `accessToken` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `refreshToken` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `tokenTime` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_accessToken_key` ON `User`(`accessToken`);

-- CreateIndex
CREATE UNIQUE INDEX `User_refreshToken_key` ON `User`(`refreshToken`);
