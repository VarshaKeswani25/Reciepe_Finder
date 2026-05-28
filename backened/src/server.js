import "dotenv/config";
import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favTable } from "./db/schema.js";
import { eq, and } from "drizzle-orm";
import cronJob from "./config/cron.js";

const app = express();
const PORT = ENV.PORT;

if(ENV.NODE_ENV==="production") cronJob.start();

app.use(express.json()); 

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});


app.post("/api/favorites", async(req, res) => {
    try {
        const {userId, recipeId, title, image, cookTime, servings} = req.body;

        if (!userId || !recipeId || !title) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
            const newfav= await db.insert(favTable).values({
                userId,
                recipeId,
                title,
                image,
                cookTime,
                servings,
            }).returning();
            res.status(201).json(newfav[0]);
        }
        catch (error) {
            console.error("Error adding favority:", error);
            res.status(500).json({ success: false, message: "Failed to add favority" });
        }
 });

 app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
    try {
        const { userId, recipeId } = req.params;

        const deleted = await db
            .delete(favTable)
            .where(
                and(
                    eq(favTable.userId, userId),
                    eq(favTable.recipeId, parseInt(recipeId))
                )
            );

        res.status(200).json({
            success: true,
            message: "Favorite deleted successfully",
            data: deleted
        });

    } catch (error) {
        console.error("Error deleting favorite:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete favorite",
            error: error.message
        });
    }
});

app.get("/api/favorites/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const favorites = await db.select().from(favTable).where(eq(favTable.userId, userId));
        res.status(200).json(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ success: false, message: "Failed to fetch favorites" });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});