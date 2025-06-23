/*
  Warnings:

  - Added the required column `upside` to the `Stake` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stake" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,
    "prediction" BOOLEAN NOT NULL,
    "stakeAmount" REAL NOT NULL,
    "upside" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Stake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Stake_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Stake" ("createdAt", "id", "marketId", "prediction", "stakeAmount", "userId") SELECT "createdAt", "id", "marketId", "prediction", "stakeAmount", "userId" FROM "Stake";
DROP TABLE "Stake";
ALTER TABLE "new_Stake" RENAME TO "Stake";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
