/*
  Warnings:

  - You are about to drop the column `artistId` on the `Album` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Album` DROP FOREIGN KEY `Album_artistId_fkey`;

-- AlterTable
ALTER TABLE `Album` DROP COLUMN `artistId`;
