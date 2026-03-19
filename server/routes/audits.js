import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';

const router = Router();
router.use(requireAdmin);

// List audits (optionally by client)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.client_id) filter.client_id = Number(req.query.client_id);
    const audits = await db.select('audits', filter);
    res.json(audits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single audit
router.get('/:id', async (req, res) => {
  try {
    const audit = await db.selectById('audits', req.params.id);
    if (!audit) return res.status(404).json({ error: 'Audit not found' });
    res.json(audit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create audit for a client
router.post('/', async (req, res) => {
  try {
    const { client_id, tech_stack, monthly_tool_spend, pain_points, current_processes } = req.body;
    if (!client_id) return res.status(400).json({ error: 'client_id required' });

    const audit = await db.insert('audits', {
      client_id,
      tech_stack: JSON.stringify(tech_stack || []),
      monthly_tool_spend: monthly_tool_spend || 0,
      pain_points: JSON.stringify(pain_points || []),
      current_processes: JSON.stringify(current_processes || []),
      ai_readiness_score: null,
      ai_report: null,
      recommendations: null,
      status: 'pending'
    });
    res.status(201).json(audit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update audit (e.g., after AI generates report)
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.update('audits', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Audit not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
