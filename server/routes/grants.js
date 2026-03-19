import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';

const router = Router();
router.use(requireAdmin);

// List grants (optionally by client)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.client_id) filter.client_id = Number(req.query.client_id);
    if (req.query.status) filter.status = req.query.status;
    const grants = await db.select('grants', filter);
    res.json(grants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single grant
router.get('/:id', async (req, res) => {
  try {
    const grant = await db.selectById('grants', req.params.id);
    if (!grant) return res.status(404).json({ error: 'Grant not found' });
    res.json(grant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create grant opportunity
router.post('/', async (req, res) => {
  try {
    const { client_id, foundation_name, grant_name, amount, deadline, focus_areas, requirements, status } = req.body;
    if (!client_id || !foundation_name) {
      return res.status(400).json({ error: 'client_id and foundation_name required' });
    }
    const grant = await db.insert('grants', {
      client_id,
      foundation_name,
      grant_name: grant_name || '',
      amount: amount || 0,
      deadline: deadline || null,
      focus_areas: JSON.stringify(focus_areas || []),
      requirements: JSON.stringify(requirements || []),
      status: status || 'identified',
      ai_match_score: null,
      application_draft: null
    });
    res.status(201).json(grant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update grant
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.update('grants', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Grant not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete grant
router.delete('/:id', async (req, res) => {
  try {
    await db.delete('grants', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
