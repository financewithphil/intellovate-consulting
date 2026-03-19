import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';

const router = Router();
router.use(requireAdmin);

// List all clients, optionally filtered by vertical
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.vertical) filter.vertical = req.query.vertical;
    if (req.query.status) filter.status = req.query.status;
    const clients = await db.select('clients', filter);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const client = await db.selectById('clients', req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, vertical, notes } = req.body;
    if (!name || !vertical) {
      return res.status(400).json({ error: 'Name and vertical are required' });
    }
    const validVerticals = ['finance', 'real_estate', 'ai_implementation', 'nonprofit'];
    if (!validVerticals.includes(vertical)) {
      return res.status(400).json({ error: `Vertical must be one of: ${validVerticals.join(', ')}` });
    }
    const client = await db.insert('clients', {
      name, email, phone, company, vertical, notes,
      status: 'discovery',
      phase: 1,
      ai_readiness_score: null
    });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.update('clients', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Client not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    await db.delete('clients', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
