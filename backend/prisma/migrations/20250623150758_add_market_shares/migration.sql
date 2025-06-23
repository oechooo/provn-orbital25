/*
  Warnings:

  - Added the required column `sharesFalse` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharesTrue` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Market" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "outcome" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sharesTrue" REAL NOT NULL,
    "sharesFalse" REAL NOT NULL,
    "probTrue" REAL NOT NULL,
    "probFalse" REAL NOT NULL,
    CONSTRAINT "Market_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Market" ("articleId", "createdAt", "id", "outcome", "probFalse", "probTrue", "resolved") SELECT "articleId", "createdAt", "id", "outcome", "probFalse", "probTrue", "resolved" FROM "Market";
DROP TABLE "Market";
ALTER TABLE "new_Market" RENAME TO "Market";
CREATE UNIQUE INDEX "Market_articleId_key" ON "Market"("articleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
