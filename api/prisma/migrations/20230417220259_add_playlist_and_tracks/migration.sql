-- CreateTable
CREATE TABLE `Playlist` (
    `id` INTEGER NOT NULL,
    `authorId` INTEGER NOT NULL,

    UNIQUE INDEX `Playlist_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Track` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `preview` VARCHAR(191) NOT NULL,
    `playlistId` INTEGER NOT NULL,

    UNIQUE INDEX `Track_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Playlist` ADD CONSTRAINT `Playlist_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Track` ADD CONSTRAINT `Track_playlistId_fkey` FOREIGN KEY (`playlistId`) REFERENCES `Playlist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
