-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceName" TEXT NOT NULL,
    "author" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "urlToImage" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT,
    "userId" INTEGER,
    CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("author", "category", "content", "createdAt", "description", "id", "publishedAt", "sourceName", "title", "url", "urlToImage") SELECT "author", "category", "content", "createdAt", "description", "id", "publishedAt", "sourceName", "title", "url", "urlToImage" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
