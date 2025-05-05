import { app } from "./app";
import { prisma } from "./prisma/client";

// Example: API route to fetch articles
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: { market: true } // Include market info for each article
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Error fetching articles" });
  }
});

// Example: API route to create a new article
app.post("/api/articles", async (req, res) => {
  try {
    const { title, content } = req.body;
    const newArticle = await prisma.article.create({
      data: {
        title,
        content
      }
    });
    res.json(newArticle);
  } catch (err) {
    res.status(500).json({ error: "Error creating article" });
  }
});

// Export the configured app
export default app;
