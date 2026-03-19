-- Intellovate Consulting Platform — Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- Clients
CREATE TABLE clients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  vertical TEXT NOT NULL CHECK (vertical IN ('finance', 'real_estate', 'ai_implementation', 'nonprofit')),
  status TEXT DEFAULT 'discovery' CHECK (status IN ('discovery', 'audit', 'building', 'active', 'completed')),
  phase INTEGER DEFAULT 1,
  ai_readiness_score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audits
CREATE TABLE audits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  tech_stack TEXT, -- JSON string
  monthly_tool_spend NUMERIC DEFAULT 0,
  pain_points TEXT, -- JSON string
  current_processes TEXT, -- JSON string
  ai_readiness_score INTEGER,
  ai_report TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows (4 phases per client)
CREATE TABLE workflows (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  duration TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  tasks TEXT DEFAULT '[]', -- JSON string
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grants (nonprofit vertical)
CREATE TABLE grants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  foundation_name TEXT NOT NULL,
  grant_name TEXT,
  amount NUMERIC DEFAULT 0,
  deadline DATE,
  focus_areas TEXT DEFAULT '[]', -- JSON string
  requirements TEXT DEFAULT '[]', -- JSON string
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'researching', 'applying', 'submitted', 'won', 'rejected')),
  ai_match_score INTEGER,
  application_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (finance/real_estate verticals)
CREATE TABLE leads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'manual',
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost')),
  score INTEGER DEFAULT 0,
  notes TEXT,
  last_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audit', 'weekly', 'monthly', 'quarterly', 'grant_app', 'proposal')),
  title TEXT NOT NULL,
  content TEXT,
  generated_by TEXT DEFAULT 'manual' CHECK (generated_by IN ('manual', 'ai')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_vertical ON clients(vertical);
CREATE INDEX idx_audits_client ON audits(client_id);
CREATE INDEX idx_workflows_client ON workflows(client_id);
CREATE INDEX idx_grants_client ON grants(client_id);
CREATE INDEX idx_leads_client ON leads(client_id);
CREATE INDEX idx_reports_client ON reports(client_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER audits_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER grants_updated_at BEFORE UPDATE ON grants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
