import express from 'express';
// Ensure the name here matches the 'export const' name in your controller
import { ingestOldArticles, evolveSingleArticle } from '../controllers/articleController.js';

const router = express.Router();

// Phase 1 Route
router.post('/ingest', ingestOldArticles);

// Phase 2 Route - MAKE SURE THIS MATCHES THE IMPORT ABOVE
router.post('/evolve', evolveSingleArticle); 

export default router;