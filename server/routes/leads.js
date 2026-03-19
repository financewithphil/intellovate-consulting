import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';

const router = Router();
router.use(requireAdmin);

// List leads (optionally by client or stage)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.client_id) filter.client_id = Number(req.query.client_id);
    if (req.query.stage) filter.stage = req.query.stage;
    const leads = await db.select('leads', filter);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create lead
router.post('/', async (req, res) => {
  try {
    const { client_id, name, email, phone, source, stage, score, notes } = req.body;
    if (!client_id || !name) {
      return res.status(400).json({ error: 'client_id and name required' });
    }
    const lead = await db.insert('leads', {
      client_id,
      name,
      email: email || '',
      phone: phone || '',
      source: source || 'manual',
      stage: stage || 'new',
      score: score || 0,
      notes: notes || '',
      last_contact: null
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.update('leads', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    await db.delete('leads', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
