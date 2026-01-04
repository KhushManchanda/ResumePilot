import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './db/database';
import resumeRoutes from './routes/resumeRoutes';
import aiRoutes from './routes/aiRoutes';
import renderRoutes from './routes/renderRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Initialize database
initializeDatabase();
console.log('Database initialized');

// API Routes
app.use('/api', resumeRoutes);
app.use('/api', aiRoutes);
app.use('/api', renderRoutes);

// Static file serving for PDFs
const pdfCacheDir = process.env.PDF_CACHE_DIR || path.join(__dirname, '../cache/pdfs');
app.use('/pdfs', express.static(pdfCacheDir));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ ResumePilot server running on http://localhost:${PORT}`);
    console.log(`📄 PDF cache directory: ${pdfCacheDir}`);
    console.log(`🔑 OpenAI API key: ${process.env.OPENAI_API_KEY ? 'configured' : 'MISSING'}`);
});

export default app;
