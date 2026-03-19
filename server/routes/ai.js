import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { db } from '../services/supabase.js';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
router.use(requireAdmin);

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}

// Generate AI audit report for a client
router.post('/audit-report', async (req, res) => {
  try {
    const { audit_id } = req.body;
    if (!audit_id) return res.status(400).json({ error: 'audit_id required' });

    const audit = await db.selectById('audits', audit_id);
    if (!audit) return res.status(404).json({ error: 'Audit not found' });

    const client = await db.selectById('clients', audit.client_id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const anthropic = getClient();
    if (!anthropic) {
      return res.status(503).json({ error: 'AI service not configured. Set ANTHROPIC_API_KEY.' });
    }

    const verticalContext = {
      finance: 'financial advisory, wealth management, CPA, or accounting firm',
      real_estate: 'real estate brokerage, property management, or investment firm',
      ai_implementation: 'business seeking AI automation and tool integration',
      nonprofit: 'nonprofit organization focused on fundraising, partnerships, and volunteer management'
    };

    const prompt = `You are an AI consulting analyst for Intellovate.ai. Generate a comprehensive AI Opportunity Report for this client.

CLIENT: ${client.name} (${client.company || 'N/A'})
VERTICAL: ${verticalContext[client.vertical] || client.vertical}
CURRENT TECH STACK: ${audit.tech_stack || 'Not provided'}
MONTHLY TOOL SPEND: $${audit.monthly_tool_spend || 0}
PAIN POINTS: ${audit.pain_points || 'Not provided'}
CURRENT PROCESSES: ${audit.current_processes || 'Not provided'}

Generate a report with these sections:
1. **Executive Summary** — 2-3 sentence overview
2. **AI Readiness Score** — Rate 1-10 with justification
3. **Top 3 Revenue-Draining Manual Processes** — What's costing them the most
4. **Quick Wins** — 3 things that can be automated in week 1
5. **Recommended AI Stack** — Specific tools and integrations
6. **ROI Projection** — Estimated monthly savings and revenue gains
7. **Risk Assessment** — What could go wrong and how to mitigate
8. **Next Steps** — Concrete action items for Phase 2

Format as clean markdown. Be specific, not generic. Use dollar amounts where possible.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const report = message.content[0].text;

    // Extract AI readiness score from report (look for X/10 pattern)
    const scoreMatch = report.match(/(\d+)\s*\/\s*10/);
    const aiScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

    // Save to audit
    await db.update('audits', audit_id, {
      ai_report: report,
      ai_readiness_score: aiScore,
      status: 'completed'
    });

    // Update client's AI readiness score
    if (aiScore) {
      await db.update('clients', audit.client_id, { ai_readiness_score: aiScore });
    }

    // Also create a report record
    await db.insert('reports', {
      client_id: audit.client_id,
      type: 'audit',
      title: `AI Opportunity Report — ${client.name}`,
      content: report,
      generated_by: 'ai'
    });

    res.json({ report, ai_readiness_score: aiScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI grant research for nonprofit clients
router.post('/grant-research', async (req, res) => {
  try {
    const { client_id, mission, focus_areas, budget_range } = req.body;
    if (!client_id) return res.status(400).json({ error: 'client_id required' });

    const client = await db.selectById('clients', client_id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const anthropic = getClient();
    if (!anthropic) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const prompt = `You are a grant research specialist for Intellovate.ai. Research and recommend grant opportunities for this nonprofit.

ORGANIZATION: ${client.name} (${client.company || 'N/A'})
MISSION: ${mission || 'Not provided'}
FOCUS AREAS: ${JSON.stringify(focus_areas || [])}
BUDGET RANGE NEEDED: ${budget_range || 'Any'}

Generate a list of 5-8 realistic grant opportunities with:
1. **Foundation Name**
2. **Grant Program Name**
3. **Typical Award Amount**
4. **Deadline** (use realistic quarterly deadlines)
5. **Focus Area Match** — Why this is a good fit
6. **Application Complexity** — Easy/Medium/Hard
7. **Match Score** — 1-10 how well it fits

Also provide:
- **Grant Strategy Summary** — Overall approach recommendation
- **Priority Order** — Which to apply for first and why
- **990 Research Tips** — What to look for in foundation tax filings

Format as structured markdown with a table for the opportunities.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const research = message.content[0].text;
    res.json({ research });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI process analysis for AI implementation clients
router.post('/process-analysis', async (req, res) => {
  try {
    const { client_id, processes, team_size, current_tools } = req.body;
    if (!client_id) return res.status(400).json({ error: 'client_id required' });

    const client = await db.selectById('clients', client_id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const anthropic = getClient();
    if (!anthropic) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const prompt = `You are an AI implementation consultant for Intellovate.ai. Analyze this company's processes and recommend an AI automation roadmap.

COMPANY: ${client.name} (${client.company || 'N/A'})
TEAM SIZE: ${team_size || 'Unknown'}
CURRENT TOOLS: ${JSON.stringify(current_tools || [])}
PROCESSES TO ANALYZE: ${JSON.stringify(processes || [])}

Generate:
1. **Process Map** — Current state of each process with bottleneck identification
2. **AI Opportunity Matrix** — For each process: automation potential (Low/Med/High), estimated time savings, recommended tool
3. **Recommended AI Stack** — Specific tools with pricing estimates
4. **Implementation Roadmap** — Phase 1 (quick wins), Phase 2 (core automation), Phase 3 (advanced AI)
5. **ROI Calculator** — Hours saved per week × hourly rate = monthly savings
6. **Risk & Change Management** — Adoption challenges and mitigation strategies

Be specific with tool names, pricing, and time estimates. No generic advice.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ analysis: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
