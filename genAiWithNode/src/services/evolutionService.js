import axios from 'axios';
import * as cheerio from 'cheerio';
import { google } from 'googleapis';
import geminiModel from '../config/gemini.js';

const customsearch = google.customsearch('v1');

/**
 * Strips Markdown formatting (Headers, Bold, Lists) to return plain text.
 * This ensures evolved content matches the "Original" style.
 */
const stripMarkdown = (text) => {
    return text
        .replace(/^#+\s+/gm, '')               // Remove headers (# Header)
        .replace(/\*\*(.*?)\*\*/g, '$1')       // Remove bold (**text**)
        .replace(/__(.*?)__/g, '$1')           // Remove double underscore bold (__text__)
        .replace(/\*(.*?)\*/g, '$1')           // Remove italic (*text*)
        .replace(/_(.*?)_/g, '$1')             // Remove underscore italic (_text_)
        .replace(/^\s*[\*\+-]\s+/gm, '')       // Remove list bullets (*, -, +)
        .replace(/^\s*\d+\.\s+/gm, '')         // Remove numbered list digits (1. )
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')    // Remove links but keep the anchor text [Link](url)
        .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')  // Remove code blocks and inline code
        .trim();
};

export const evolve = async (article) => {
    console.log(` Phase 2: Starting evolution for: "${article.title}"`);

    let links = [];
    
    // 1. Search Google for competitors (With Quota Fallback)
    try {
        const searchResults = await customsearch.cse.list({
            auth: process.env.GOOGLE_API_KEY, 
            cx: process.env.GOOGLE_CX,
            q: `${article.title} blog`, 
            num: 2 
        });
        links = (searchResults.data.items || []).map(item => ({ 
            title: item.title, 
            url: item.link 
        }));
    } catch (err) {
        console.warn("⚠️ Google Search Quota Exceeded. Using cached/mock links.");
        links = [
            { title: "Customer Success Platform Guide", url: "https://example.com/guide" },
            { title: "Industry Efficiency Standards", url: "https://example.com/standards" }
        ];
    }

    // 2. Scrape Competitor Content
    let competitorContext = "";
    for (const link of links) {
        try {
            const { data: html } = await axios.get(link.url, { timeout: 5000 });
            const $ = cheerio.load(html);
            $('script, style, nav, footer').remove();
            const bodyText = $('p').map((i, el) => $(el).text()).get().join(' ').substring(0, 2000);
            competitorContext += `SOURCE: ${link.title}\nCONTENT: ${bodyText}\n\n`;
        } catch (err) {
            console.warn(`Could not scrape ${link.url}: ${err.message}`);
        }
    }

    // 3. Optimized Prompt for PLAIN TEXT generation
    const prompt = `
        ROLE: Expert Content Strategist.
        TASK: Rewrite the following original article to have more depth, professional tone, and better flow, inspired by the competitor context provided.
        
        CRITICAL FORMATTING RULES:
        1. DO NOT use any Markdown symbols (NO #, NO **, NO *, NO links).
        2. Use PLAIN TEXT only.
        3. Use simple line breaks for paragraphs.
        4. For section headers, simply write the header text in ALL CAPS on its own line.
        5. Do not include a "Reference" or "Source" section in the AI response; I will handle that separately.
        
        ORIGINAL ARTICLE:
        Title: ${article.title}
        Content: ${article.content}

        COMPETITOR CONTEXT:
        ${competitorContext}
    `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const rawEvolvedText = response.text();

        // Final Clean-up: Apply Regex to ensure no Markdown leaked through
        const finalCleanText = stripMarkdown(rawEvolvedText);

        // 4. Return the clean text (Citations are stored separately in the 'references' DB column)
        return finalCleanText;

    } catch (llmError) {
        console.error("LLM Generation Error:", llmError.message);
        throw new Error("Gemini AI failed. Quota likely exceeded.");
    }
};