import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';

const router = Router();
router.use(requireAdmin);

// List reports
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.client_id) filter.client_id = Number(req.query.client_id);
    if (req.query.type) filter.type = req.query.type;
    const reports = await db.select('reports', filter);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await db.selectById('reports', req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create report
router.post('/', async (req, res) => {
  try {
    const { client_id, type, title, content } = req.body;
    if (!client_id || !type) {
      return res.status(400).json({ error: 'client_id and type required' });
    }
    const validTypes = ['audit', 'weekly', 'monthly', 'quarterly', 'grant_app', 'proposal'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
    }
    const report = await db.insert('reports', {
      client_id,
      type,
      title: title || `${type} Report`,
      content: content || '',
      generated_by: 'manual'
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete report
router.delete('/:id', async (req, res) => {
  try {
    await db.delete('reports', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
