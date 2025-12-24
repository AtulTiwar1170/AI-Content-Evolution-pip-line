import * as scraperService from '../services/scraperService.js';
import * as evolutionService from '../services/evolutionService.js';
import axios from 'axios';

/**
 * Phase 1: Ingest 5 oldest articles
 * Scrapes articles and saves them as "Original" in Laravel.
 */
export const ingestOldArticles = async (req, res) => {
    try {
        const targetUrl = "https://beyondchats.com/blogs/page/14/";
        
        // 1. Scrape the articles
        const articles = await scraperService.scrapeArticles(targetUrl, 5);
        
        if (articles.length === 0) {
            return res.status(400).json({ message: "Scraper found no data." });
        }

        const results = [];
        // Sequential ingestion to avoid database locks
        for (const article of articles) {
            const response = await axios.post(`${process.env.LARAVEL_API_URL}/articles`, article);
            results.push(response.data);
        }

        return res.status(200).json({
            message: "Ingestion complete",
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error("Ingestion Error:", error.message);
        return res.status(500).json({ error: "Failed to ingest articles" });
    }
};

/**
 * Phase 2: Evolve Single Article
 * 1. Checks if already evolved to save quota.
 * 2. Processes ONLY the ID sent in the request (NO loops).
 */
export const evolveSingleArticle = async (req, res) => {
    try {
        const { id } = req.body; // Expecting { "id": 36 } from your React Frontend

        if (!id) {
            return res.status(400).json({ error: "Article ID is required." });
        }

        // 1. Fetch the current state of the article from Laravel
        const response = await axios.get(`${process.env.LARAVEL_API_URL}/articles/${id}`);
        const article = response.data.data || response.data;

        if (!article) {
            return res.status(404).json({ error: "Article not found in database." });
        }

        // 2. DUPLICATE PROTECTION: Stop if already evolved
        if (article.author === "Gemini AI") {
            console.log(`⚠️ Skipping ID ${id}: Already optimized by AI.`);
            return res.status(200).json({ 
                message: "This article is already optimized.",
                data: article,
                alreadyEvolved: true
            });
        }

        console.log(`🚀 Evolving Article ID ${article.id}: "${article.title}"`);

        // 3. Perform Evolution (Calls Google Search & Gemini)
        // This is where your evolutionService.js handles the research and cleanup
        const evolvedContent = await evolutionService.evolve(article);

        // 4. Prepare Payload for Seamless Overwrite
        const updatePayload = {
            title: article.title,
            content: evolvedContent,
            author: "Gemini AI", // Marking it so it won't be evolved again
            published_at: article.published_at // Keep original date
        };

        // 5. Send PUT request to Laravel to update the existing record
        const updateRes = await axios.put(
            `${process.env.LARAVEL_API_URL}/articles/${article.id}`, 
            updatePayload
        );

        return res.status(200).json({
            message: "Evolution complete. Article updated successfully.",
            data: updateRes.data
        });

    } catch (error) {
        // Handle specific Quota Errors from Gemini or Google
        const errorMessage = error.message.includes('429') 
            ? "API Quota Exceeded. Please try again in 60 seconds." 
            : error.message;

        console.error(`❌ Evolution Error (ID ${req.body.id}):`, errorMessage);
        
        return res.status(500).json({ 
            error: "Evolution failed", 
            details: errorMessage 
        });
    }
};