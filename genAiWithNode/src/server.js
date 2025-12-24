/**
 * src/server.js
 * The Entry Point: Responsible for environment loading and server ignition.
 */
import app from './app.js';
import dotenv from 'dotenv';

// 1. Initialize environment variables at the absolute top of the entry point
dotenv.config();

// 2. Define Port with a fallback for local development
const PORT = process.env.PORT || 3000;

// 3. Graceful Startup: Wrap in a function to allow for async pre-checks (like DB connectivity)
const startServer = async () => {
    try {
        // Here you would verify connectivity to your Laravel API or DB if needed
        
        app.listen(PORT, () => {
            console.log(`
            🚀 Gemini AI Service is active
            📡 Listening on: http://localhost:${PORT}
            📂 Version: 1.0.0
            🛠️  Ready for Ingestion & Evolution
            `);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1); // Exit with failure code
    }
};

// 4. Handle Uncaught Exceptions (Standard Google SRE practice)
process.on('unhandledRejection', (err) => {
    console.error('CRITICAL: Unhandled Rejection at Promise', err);
    // In a production env, you would log this to a service like Google Cloud Logging
});

startServer();