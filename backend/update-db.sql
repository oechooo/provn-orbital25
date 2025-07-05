-- Database update operations
-- Delete article with id=1 and update article id=30

-- Delete article with id=1
DELETE FROM Article WHERE id = 1;

-- Update article with id=30 to set userId=2
UPDATE Article SET userId = 2 WHERE id = 30;

-- Show the results
SELECT 'Articles after update:' as info;
SELECT id, title, userId, url FROM Article WHERE id IN (1, 30) OR userId = 2;
