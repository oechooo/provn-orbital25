/*
  Warnings:

  - You are about to drop the column `resolved` on the `Market` table. All the data in the column will be lost.
  - Added the required column `nextResolve` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Market" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "resolveCount" INTEGER NOT NULL DEFAULT 0,
    "outcome" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextResolve" DATETIME NOT NULL,
    "sharesTrue" REAL NOT NULL,
    "sharesFalse" REAL NOT NULL,
    "probTrue" REAL NOT NULL,
    "probFalse" REAL NOT NULL,
    CONSTRAINT "Market_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Market" ("articleId", "createdAt", "id", "outcome", "probFalse", "probTrue", "sharesFalse", "sharesTrue") SELECT "articleId", "createdAt", "id", "outcome", "probFalse", "probTrue", "sharesFalse", "sharesTrue" FROM "Market";
DROP TABLE "Market";
ALTER TABLE "new_Market" RENAME TO "Market";
CREATE UNIQUE INDEX "Market_articleId_key" ON "Market"("articleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
