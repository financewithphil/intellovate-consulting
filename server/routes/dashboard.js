import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';

const router = Router();
router.use(requireAdmin);

// Dashboard overview — aggregate stats
router.get('/', async (req, res) => {
  try {
    const clients = await db.select('clients');
    const audits = await db.select('audits');
    const workflows = await db.select('workflows');
    const grants = await db.select('grants');
    const leads = await db.select('leads');

    // Client stats by vertical
    const verticalCounts = { finance: 0, real_estate: 0, ai_implementation: 0, nonprofit: 0 };
    const statusCounts = { discovery: 0, audit: 0, building: 0, active: 0, completed: 0 };
    for (const c of clients) {
      if (verticalCounts[c.vertical] !== undefined) verticalCounts[c.vertical]++;
      if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
    }

    // Grant pipeline
    const grantStats = {
      total: grants.length,
      identified: grants.filter(g => g.status === 'identified').length,
      applying: grants.filter(g => g.status === 'applying').length,
      submitted: grants.filter(g => g.status === 'submitted').length,
      won: grants.filter(g => g.status === 'won').length,
      total_value: grants.reduce((sum, g) => sum + (g.amount || 0), 0)
    };

    // Lead pipeline
    const leadStats = {
      total: leads.length,
      new: leads.filter(l => l.stage === 'new').length,
      qualified: leads.filter(l => l.stage === 'qualified').length,
      proposal: leads.filter(l => l.stage === 'proposal').length,
      closed: leads.filter(l => l.stage === 'closed').length
    };

    // Active phases
    const activeWorkflows = workflows.filter(w => w.status === 'active');

    res.json({
      clients: {
        total: clients.length,
        by_vertical: verticalCounts,
        by_status: statusCounts
      },
      audits: {
        total: audits.length,
        pending: audits.filter(a => a.status === 'pending').length,
        completed: audits.filter(a => a.status === 'completed').length
      },
      grants: grantStats,
      leads: leadStats,
      active_phases: activeWorkflows.length,
      recent_clients: clients.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
