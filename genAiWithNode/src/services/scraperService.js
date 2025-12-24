import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes articles from a given URL.
 * @param {string} url - The target URL (e.g., https://beyondchats.com/blogs/page/15/)
 * @param {number} limit - Number of articles to return (default 5)
 */
// src/services/scraperService.js
export const scrapeArticles = async (url, limit = 5) => {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });

        const $ = cheerio.load(html);
        const articles = [];

        // Updated Selectors: Looking for standard WordPress and Elementor patterns
        // We try to find any element that looks like a post container
        const postSelector = 'article, .elementor-post, .post, .blog-post';

        $(postSelector).each((index, element) => {
            if (index >= limit) return false;

            // Try multiple title selectors
            const title = $(element).find('h2, h3, .entry-title, .elementor-post__title').text().trim();
            
            // Try multiple excerpt selectors
            const content = $(element).find('.entry-content p, .elementor-post__excerpt p, p').first().text().trim();
            
            const author = $(element).find('.author, .elementor-post-author').text().trim() || 'Admin';
            const date = $(element).find('time').attr('datetime') || new Date().toISOString();

            // console.log(title, content, author, date);
            if (title && content) {
                articles.push({
                    title,
                    content: content.substring(0, 500), // Clean up long excerpts
                    author,
                    published_at: date
                });
            }
        });

        return articles;
    } catch (error) {
        console.error("Scraper Error:", error.message);
        return [];
    }
};


















// // ai-service-node/scraper.js
// const axios = require('axios');
// const cheerio = require('cheerio');

// async function scrapeOldestArticles() {
//     const url = "https://beyondchats.com/blogs/"; // The last page
//     try {
//         const { data } = await axios.get(url);
//         const $ = cheerio.cheerio.load(data);
//         const articles = [];

        
        

//         // Selecting article elements (based on the site's structure)
//         $('article').each((i, el) => {
//             if (i < 5) { // Get the first 5 on the last page (oldest)
                
//                 articles.push({
//                     title: $(el).find('h2.entry-title').text().trim(),
//                     content: $(el).find('.entry-content p').first().text().trim(),
//                     author: $(el).find('.author').text().trim() || 'Admin',
//                     published_at: $(el).find('time').attr('datetime') || new Date().toISOString()
//                 });
//             }
//         });

//         return articles;
//     } catch (error) {
//         console.error("Scraping failed", error);
//     }
// }