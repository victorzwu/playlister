/*
  Warnings:

  - Added the required column `authorId` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Album` ADD COLUMN `authorId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Track` ADD COLUMN `authorId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `picture` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Album` ADD CONSTRAINT `Album_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Track` ADD CONSTRAINT `Track_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
