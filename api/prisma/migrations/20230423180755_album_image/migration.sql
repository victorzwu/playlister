/*
  Warnings:

  - Added the required column `image` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Album` ADD COLUMN `image` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Track` ADD COLUMN `image` VARCHAR(191) NOT NULL;
