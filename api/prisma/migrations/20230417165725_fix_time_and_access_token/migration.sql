-- DropIndex
DROP INDEX `User_accessToken_key` ON `User`;

-- AlterTable
ALTER TABLE `User` MODIFY `accessToken` TEXT NULL;
