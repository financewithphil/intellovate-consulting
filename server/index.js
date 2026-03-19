import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import auditRoutes from './routes/audits.js';
import workflowRoutes from './routes/workflows.js';
import grantRoutes from './routes/grants.js';
import leadRoutes from './routes/leads.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import aiRoutes from './routes/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3200;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true
    : [process.env.CLIENT_URL || 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Too many AI requests' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: { error: 'Too many auth attempts' } });

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/grants', grantRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// Serve frontend in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Intellovate Consulting Platform running on port ${PORT}`);
});
