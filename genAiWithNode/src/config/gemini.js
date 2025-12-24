import { GoogleGenerativeAI } from "@google/generative-ai";
// import { GoogleGenAI } from "@google/genai";

import dotenv from 'dotenv';

dotenv.config();

// 1. Initialize the Google Gen AI Client

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Configure our specific "Evolution" model
// We use gemini-1.5-flash for its speed and efficiency in reformatting tasks.

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // System instructions act as a permanent persona for the AI
    systemInstruction: `
        You are an expert SEO Content Strategist at Google. 
        Your goal is to take an original blog post and 'evolve' it. 
        You will be provided with the original article and two high-ranking reference articles. 
        Your output must:
        1. Adopt the formatting style (headings, bullet points, tone) of the reference articles.
        2. Incorporate key missing information found in references while maintaining original intent.
        3. Output strictly in valid Markdown.
        4. Never hallucinate facts not present in the provided context.
    `
});

export default model;