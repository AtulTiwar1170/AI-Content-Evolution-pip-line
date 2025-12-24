import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import articleRoutes from './routes/articleRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

/**
 * 1. Global Middleware
 */
// Security: Helmet sets various HTTP headers to help protect your app
app.use(helmet()); 

// Cross-Origin Resource Sharing: Essential for your React Frontend to communicate
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Request Logging: 'dev' format provides colored logs in your console
app.use(morgan('dev'));

// Body Parsers: Allows the app to read JSON payloads from Laravel or React
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * 2. API Routes
 */
// We prefix all our AI-service routes with /api/v1 for versioning
app.use('/api/v1/articles', articleRoutes);

/**
 * 3. Health Check
 * Standard in Google microservices to ensure the container is alive
 */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

/**
 * 4. Error Handling
 * This must be the LAST middleware in the stack
 */
app.use(errorHandler);

export default app;