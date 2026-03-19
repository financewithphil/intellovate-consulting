import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';

const router = Router();
router.use(requireAdmin);

const PHASES = [
  { phase: 1, name: 'Discovery & Audit', duration: 'Week 1' },
  { phase: 2, name: 'System Architecture', duration: 'Week 2-3' },
  { phase: 3, name: 'Build & Deploy', duration: 'Week 3-6' },
  { phase: 4, name: 'Optimize & Operate', duration: 'Ongoing' }
];

// Get workflows for a client
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.client_id) filter.client_id = Number(req.query.client_id);
    const workflows = await db.select('workflows', filter);
    res.json(workflows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize all 4 phases for a client
router.post('/initialize', async (req, res) => {
  try {
    const { client_id } = req.body;
    if (!client_id) return res.status(400).json({ error: 'client_id required' });

    const workflows = [];
    for (const phase of PHASES) {
      const wf = await db.insert('workflows', {
        client_id,
        phase: phase.phase,
        phase_name: phase.name,
        duration: phase.duration,
        status: phase.phase === 1 ? 'active' : 'pending',
        tasks: JSON.stringify([]),
        notes: ''
      });
      workflows.push(wf);
    }
    res.status(201).json(workflows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a workflow phase
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.update('workflows', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Workflow not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advance client to next phase
router.post('/:id/advance', async (req, res) => {
  try {
    const current = await db.selectById('workflows', req.params.id);
    if (!current) return res.status(404).json({ error: 'Workflow not found' });

    // Mark current as completed
    await db.update('workflows', req.params.id, { status: 'completed' });

    // Find and activate next phase
    const allWorkflows = await db.select('workflows', { client_id: current.client_id });
    const nextPhase = allWorkflows.find(w => w.phase === current.phase + 1);
    if (nextPhase) {
      await db.update('workflows', nextPhase.id, { status: 'active' });
    }

    res.json({ success: true, completed: current.phase, next: nextPhase?.phase || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get phase definitions
router.get('/phases', (_req, res) => {
  res.json(PHASES);
});

export default router;
