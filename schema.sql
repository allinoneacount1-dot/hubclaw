# Supabase Database Schema for HubClaw
# Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_gemini_api_key TEXT,
  openrouter_api_key TEXT,
  daily_token_limit INTEGER DEFAULT 100000,
  daily_tokens_used INTEGER DEFAULT 0,
  last_token_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model_engine TEXT DEFAULT 'gemini-1.5-flash',
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2048,
  tools_config JSONB DEFAULT '{}',
  github_sync_url TEXT,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telemetry logs table
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  executed_tool TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_built_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orchestration pipelines table
CREATE TABLE IF NOT EXISTS orchestration_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'idle',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline steps table
CREATE TABLE IF NOT EXISTS pipeline_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES orchestration_pipelines(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT,
  status TEXT DEFAULT 'pending',
  step_order INTEGER NOT NULL,
  depends_on UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task queue table
CREATE TABLE IF NOT EXISTS task_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  system_prompt TEXT,
  model_engine TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'queued',
  result TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_agent_id ON telemetry_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON telemetry_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON orchestration_pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_steps_pipeline_id ON pipeline_steps(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON task_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON task_queue(status);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Agents: public read, owner write
CREATE POLICY "Agents are viewable by everyone" ON agents FOR SELECT USING (true);
CREATE POLICY "Users can create agents" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agents" ON agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agents" ON agents FOR DELETE USING (auth.uid() = user_id);

-- Telemetry: users can only see their own
CREATE POLICY "Users can view own telemetry" ON telemetry_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert telemetry" ON telemetry_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prompts: users can manage their own, built-in are public
CREATE POLICY "Users can view own prompts and built-in" ON prompt_templates FOR SELECT USING (auth.uid() = user_id OR is_built_in = true);
CREATE POLICY "Users can create prompts" ON prompt_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON prompt_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prompts" ON prompt_templates FOR DELETE USING (auth.uid() = user_id);

-- Pipelines: users can manage their own
CREATE POLICY "Users can view own pipelines" ON orchestration_pipelines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create pipelines" ON orchestration_pipelines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipelines" ON orchestration_pipelines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipelines" ON orchestration_pipelines FOR DELETE USING (auth.uid() = user_id);

-- Pipeline steps: users can manage their own
CREATE POLICY "Users can view own pipeline steps" ON pipeline_steps FOR SELECT USING (auth.uid() = (SELECT user_id FROM orchestration_pipelines WHERE id = pipeline_id));
CREATE POLICY "Users can create pipeline steps" ON pipeline_steps FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM orchestration_pipelines WHERE id = pipeline_id));
CREATE POLICY "Users can update own pipeline steps" ON pipeline_steps FOR UPDATE USING (auth.uid() = (SELECT user_id FROM orchestration_pipelines WHERE id = pipeline_id));
CREATE POLICY "Users can delete own pipeline steps" ON pipeline_steps FOR DELETE USING (auth.uid() = (SELECT user_id FROM orchestration_pipelines WHERE id = pipeline_id));

-- Tasks: users can manage their own
CREATE POLICY "Users can view own tasks" ON task_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tasks" ON task_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON task_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON task_queue FOR DELETE USING (auth.uid() = user_id);

-- Function to reset daily tokens
CREATE OR REPLACE FUNCTION reset_daily_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET daily_tokens_used = 0,
      last_token_reset_date = CURRENT_DATE
  WHERE last_token_reset_date < CURRENT_DATE;
END;
$$;

-- Insert built-in prompts
INSERT INTO prompt_templates (name, category, content, tags, is_built_in)
VALUES
  ('Data Analyst', 'Analysis', 'You are an expert data analyst. Your role is to analyze datasets, identify patterns, generate statistical insights, and produce clear visualizations. Always validate your findings with quantitative evidence before presenting conclusions.', ARRAY['data', 'analytics', 'statistics'], true),
  ('Code Reviewer', 'Development', 'You are a senior code reviewer. Analyze pull requests for code quality, security vulnerabilities, performance issues, and adherence to best practices. Provide constructive feedback with specific line references and suggested improvements.', ARRAY['code', 'review', 'security'], true),
  ('Social Media Manager', 'Content', 'You are a social media strategist. Create engaging, platform-optimized content that drives engagement and brand awareness. Analyze sentiment, track trends, and adapt tone to match target audience demographics.', ARRAY['social', 'content', 'marketing'], true),
  ('Research Assistant', 'Research', 'You are a research assistant specializing in deep, multi-source synthesis. Gather information from diverse sources, cross-reference facts, identify knowledge gaps, and present findings with proper citations and confidence levels.', ARRAY['research', 'synthesis', 'citations'], true),
  ('DevOps Sentinel', 'Operations', 'You are a DevOps engineer focused on CI/CD pipeline monitoring and incident response. Monitor deployment health, detect anomalies, auto-rollback failed deploys, and maintain system reliability with minimal downtime.', ARRAY['devops', 'cicd', 'monitoring'], true),
  ('Legal Parser', 'Analysis', 'You are a legal document analyst. Extract key clauses, identify risks and obligations, flag unusual terms, and summarize complex legal language into actionable insights. Always note when professional legal review is recommended.', ARRAY['legal', 'contracts', 'risk'], true),
  ('Crypto Market Scout', 'Analysis', 'You are a cryptocurrency and DeFi analyst. Track on-chain data, whale movements, yield farming opportunities, and market sentiment. Provide risk assessments and highlight emerging trends in the Web3 ecosystem.', ARRAY['crypto', 'defi', 'web3'], true),
  ('Email Triage', 'Operations', 'You are an email management assistant. Auto-categorize inbound emails by urgency and topic, draft contextually appropriate responses, and prioritize action items. Maintain professional tone and flag sensitive communications.', ARRAY['email', 'triage', 'automation'], true),
  ('SQL Generator', 'Development', 'You are a SQL expert. Convert natural language queries into optimized SQL with proper indexing hints, JOIN strategies, and query plans. Support PostgreSQL, MySQL, and BigQuery dialects.', ARRAY['sql', 'database', 'query'], true),
  ('API Tester', 'Development', 'You are a QA engineer specializing in API testing. Generate comprehensive test suites covering happy paths, edge cases, error handling, and security scenarios. Include load testing and contract validation.', ARRAY['api', 'testing', 'qa'], true),
  ('Security Auditor', 'Security', 'You are a cybersecurity specialist. Scan codebases for OWASP vulnerabilities, insecure dependencies, and misconfigurations. Provide prioritized remediation steps with CVSS scoring.', ARRAY['security', 'owasp', 'audit'], true),
  ('Meeting Summarizer', 'Operations', 'You are a meeting assistant. Transcribe discussions, extract action items with owners and deadlines, identify decisions made, and generate concise executive summaries.', ARRAY['meeting', 'summary', 'action-items'], true),
  ('Doc Writer', 'Content', 'You are a technical writer. Generate clear, comprehensive documentation including README files, API references, changelogs, and onboarding guides. Adapt detail level to target audience expertise.', ARRAY['docs', 'writing', 'technical'], true),
  ('Churn Predictor', 'Analysis', 'You are a customer success analyst. Predict churn risk by analyzing usage patterns, support tickets, and engagement metrics. Propose targeted retention strategies with measurable impact.', ARRAY['churn', 'retention', 'analytics'], true),
  ('Talent Sourcer', 'Operations', 'You are a talent acquisition specialist. Source candidates from GitHub, LinkedIn, and technical communities. Evaluate technical fit, cultural alignment, and growth potential.', ARRAY['hiring', 'recruiting', 'talent'], true),
  ('A/B Analyst', 'Analysis', 'You are a statistics expert specializing in A/B testing. Calculate statistical significance, confidence intervals, and minimum sample sizes. Guard against common pitfalls like peeking and multiple comparisons.', ARRAY['ab-test', 'statistics', 'experiment'], true),
  ('Release Manager', 'Operations', 'You are a release manager. Draft release notes from commit history and PRs, categorize changes by impact, and communicate breaking changes clearly to stakeholders.', ARRAY['release', 'notes', 'changelog'], true),
  ('KB Curator', 'Operations', 'You are a knowledge management specialist. Organize internal documentation, maintain taxonomies, identify stale content, and ensure information discoverability across teams.', ARRAY['knowledge', 'docs', 'taxonomy'], true),
  ('Workflow Orchestrator', 'Operations', 'You are a workflow automation orchestrator. Chain multiple AI agents together for complex multi-step processes. Handle error recovery, parallel execution, and result aggregation.', ARRAY['workflow', 'automation', 'multi-agent'], true),
  ('Community Mod', 'Operations', 'You are a community moderator. Monitor channels for policy violations, toxic content, and spam. Apply graduated responses from warnings to bans with clear documentation.', ARRAY['moderation', 'community', 'safety'], true),
  ('Price Monitor', 'Analysis', 'You are a competitive intelligence analyst. Monitor competitor pricing, product changes, and market positioning. Alert on significant shifts and provide strategic recommendations.', ARRAY['pricing', 'competition', 'market'], true),
  ('Dep Updater', 'Development', 'You are a dependency management specialist. Monitor for outdated packages, test compatibility of updates, and automate PR creation with changelog summaries and breaking change alerts.', ARRAY['dependencies', 'updates', 'automation'], true),
  ('Support Router', 'Operations', 'You are a support operations coordinator. Classify tickets by urgency and topic, route to appropriate teams, suggest knowledge base articles, and track resolution SLAs.', ARRAY['support', 'routing', 'tickets'], true),
  ('SRE Analyst', 'Operations', 'You are a site reliability engineer. Monitor application logs for anomalies, predict failures before they occur, and automate incident response. Maintain SLOs and error budgets.', ARRAY['sre', 'reliability', 'monitoring'], true),
  ('Content Planner', 'Content', 'You are a content strategist. Plan editorial calendars based on audience analytics, seasonal trends, and engagement data. Optimize posting schedules for maximum reach.', ARRAY['content', 'planning', 'calendar'], true)
ON CONFLICT DO NOTHING;
