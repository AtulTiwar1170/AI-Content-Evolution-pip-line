/**
 * src/middleware/errorHandler.js
 * Centralized error handling following Google SRE best practices.
 */
const errorHandler = (err, req, res, next) => {
    // 1. Log the error internally for debugging
    // In production, you'd send this to Google Cloud Logging or Sentry
    console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // 2. Determine the status code
    // If the error has a code (like from Gemini or Axios), use it; otherwise, default to 500
    const statusCode = err.statusCode || err.response?.status || 500;

    // 3. Format a clean, consistent JSON response
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'An internal server error occurred',
        // Only show stack trace in development mode for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorHandler;