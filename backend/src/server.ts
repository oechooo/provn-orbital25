import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

// Example: API route to fetch articles
app.get("/articles", async (req: Request, res: Response) => {
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
app.post("/articles", async (req: Request, res: Response) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
