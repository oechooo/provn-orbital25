-- AlterTable
ALTER TABLE "Stake" ADD COLUMN "won" BOOLEAN;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "provePoints" REAL NOT NULL DEFAULT 100,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatarSkinColor" TEXT NOT NULL DEFAULT 'fdbcb4',
    "avatarHairColor" TEXT NOT NULL DEFAULT '724133',
    "avatarHair" TEXT NOT NULL DEFAULT 'short01',
    "avatarEyes" TEXT NOT NULL DEFAULT 'variant01',
    "avatarMouth" TEXT NOT NULL DEFAULT 'variant01',
    "avatarAccessories" TEXT NOT NULL DEFAULT 'none'
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "provePoints", "resetToken", "resetTokenExpiry", "updatedAt", "username") SELECT "createdAt", "email", "id", "password", "provePoints", "resetToken", "resetTokenExpiry", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
