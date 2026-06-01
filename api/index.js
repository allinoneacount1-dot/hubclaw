const { createClient } = require('@supabase/supabase-js');

const SB_URL = process.env.SUPABASE_URL || '';
const SB_ANON = process.env.SUPABASE_ANON_KEY || '';
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY || '';
const OR_KEY = process.env.OPENROUTER_API_KEY || '';
const MOCK = process.env.MOCK_AI === 'true';
const ANON = process.env.ALLOW_ANON === 'true';

const supabase = createClient(SB_URL, SB_ANON);

const MODELS = {
  'gemini-2.0-flash': 'google/gemini-2.0-flash-exp:free',
  'gemini-1.5-pro': 'google/gemini-2.0-flash-exp:free',
  'gemini-1.5-flash': 'google/gemini-2.0-flash-exp:free',
  'claude-sonnet-4': 'nvidia/nemotron-4-340b-instruct:free',
  'claude-haiku-4': 'mistralai/mistral-7b-instruct:free',
  'claude-opus-4': 'meta-llama/llama-3.1-70b-instruct:free',
  'gpt-4o': 'deepseek/deepseek-r1:free',
  'gpt-4o-mini': 'qwen/qwen-2-7b-instruct:free',
  'deepseek-r1': 'deepseek/deepseek-r1:free',
  'owl-alpha': 'openrouter/owl-alpha:free',
  'nemotron': 'nvidia/nemotron-4-340b-instruct:free',
};
const DEF_MODEL = 'nvidia/nemotron-4-340b-instruct:free';
const FALLBACKS = ['nvidia/nemotron-4-340b-instruct:free','google/gemini-2.0-flash-exp:free','deepseek/deepseek-r1:free','meta-llama/llama-3.1-70b-instruct:free','mistralai/mistral-7b-instruct:free'];

function resolveModel(m) { return MODELS[m] || (m && m.includes('/') ? m : DEF_MODEL); }

async function callOR(key, msgs, model, temp, max) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`, 'HTTP-Referer': 'https://hubclaw.vercel.app', 'X-Title': 'HubClaw' },
    body: JSON.stringify({ model, messages: msgs, temperature: temp, max_tokens: max }),
  });
  if (!r.ok) throw new Error(`OR ${r.status}: ${await r.text().catch(()=>'?')}`);
  const d = await r.json();
  return { text: d.choices[0].message.content || '', tokens: d.usage?.total_tokens || 0, model: d.model || model };
}

async function runAI(prompt, sys, model, temp, max, key) {
  if (MOCK || !key) {
    await new Promise(r => setTimeout(r, 400));
    return { text: `🤖 [Mock Mode] Processed: "${prompt.slice(0,60)}..." | Model: ${model} | temp=${max} | Set OPENROUTER_API_KEY for real AI`, tokens: 50, model };
  }
  const msgs = [];
  if (sys) msgs.push({ role: 'system', content: sys });
  msgs.push({ role: 'user', content: prompt });
  const chain = [resolveModel(model), ...FALLBACKS].filter((m,i,a) => a.indexOf(m) === i);
  let lastErr;
  for (const m of chain) {
    try { return await callOR(key, msgs, m, temp, max); }
    catch(e) { lastErr = e; if (e.message?.includes('429') || e.message?.includes('404')) continue; throw e; }
  }
  throw lastErr;
}

async function uid(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try { const { data } = await supabase.auth.getUser(h.split(' ')[1]); return data.user?.id || null; } catch { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = (req.url || '').split('?')[0];

  try {
    if (path === '/api/health') {
      return res.json({ status: 'ok', time: new Date().toISOString(), ai: OR_KEY ? 'openrouter' : 'mock', sb: SB_URL ? 'ok' : 'no' });
    }

    if (path === '/api/models') {
      return res.json({ models: [
        { id: 'nvidia/nemotron-4-340b-instruct:free', name: 'Nemotron 4 340B' },
        { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash' },
        { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1' },
        { id: 'meta-llama/llama-3.1-70b-instruct:free', name: 'Llama 3.1 70B' },
        { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B' },
        { id: 'openrouter/owl-alpha:free', name: 'OWL Alpha' },
      ]});
    }

    if (path === '/api/run' && req.method === 'POST') {
      const t0 = Date.now();
      const userId = (await uid(req)) || (ANON ? '00000000-0000-0000-0000-000000000000' : null);
      if (!userId) return res.status(401).json({ error: 'Auth required' });
      const { agentId, systemPrompt, userMessage, modelEngine, temperature, maxTokens } = req.body || {};
      if (!userMessage) return res.status(400).json({ error: 'userMessage required' });
      let apiKey = OR_KEY;
      const { data: prof } = await supabase.from('profiles').select('openrouter_api_key').eq('id', userId).single();
      if (prof && prof.openrouter_api_key) apiKey = prof.openrouter_api_key;
      let agentCfg = {};
      if (agentId) { const { data } = await supabase.from('agents').select('*').eq('id', agentId).single(); if (data) agentCfg = data; }
      const result = await runAI(userMessage, systemPrompt || agentCfg.system_prompt || '', modelEngine || agentCfg.model_engine || DEF_MODEL, temperature ?? agentCfg.temperature ?? 0.7, maxTokens ?? agentCfg.max_tokens ?? 2048, apiKey);
      const ms = Date.now() - t0;
      try { await supabase.from('telemetry_logs').insert({ agent_id: agentId, user_id: userId, tokens_used: result.tokens, latency_ms: ms, status: 'success', message: `[OK] ${result.model} ${ms}ms` }); } catch(e) {}
      return res.json({ response: result.text, tokensUsed: result.tokens, latencyMs: ms, status: 'success' });
    }

    if (path === '/api/agents' && req.method === 'GET') {
      const { data, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ agents: data || [] });
    }

    if (path === '/api/agents' && req.method === 'POST') {
      const userId = (await uid(req)) || (ANON ? '00000000-0000-0000-0000-000000000000' : null);
      const b = req.body || {};
      if (!b.name) return res.status(400).json({ error: 'name required' });
      const { data, error } = await supabase.from('agents').insert({ user_id: userId, name: b.name, description: b.description || '', system_prompt: b.system_prompt || '', model_engine: b.model_engine || DEF_MODEL, temperature: b.temperature ?? 0.7, max_tokens: b.max_tokens ?? 2048, tools_config: b.tools_config || {} }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ agent: data });
    }

    if (path.startsWith('/api/analytics') && req.method === 'GET') {
      const userId = (await uid(req)) || (ANON ? '00000000-0000-0000-0000-000000000000' : null);
      const aid = path.split('/').pop();
      let q = supabase.from('telemetry_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(200);
      if (aid && aid !== 'analytics' && aid !== 'all') q = q.eq('agent_id', aid);
      const { data: logs, error } = await q;
      if (error) return res.status(500).json({ error: error.message });
      const daily = {}, buckets = {};
      (logs || []).forEach((l) => {
        if (l.created_at) {
          const d = new Date(l.created_at).toISOString().split('T')[0];
          daily[d] = (daily[d] || 0) + (l.tokens_used || 0);
          if (l.latency_ms) { const h = new Date(l.created_at).getHours()+':00'; if (!buckets[h]) buckets[h] = []; buckets[h].push(l.latency_ms); }
        }
      });
      return res.json({
        tokenTrends: Object.entries(daily).map(([date,tokens]) => ({date,tokens})).sort((a,b) => a.date.localeCompare(b.date)).slice(-14),
        latencyMatrix: Object.entries(buckets).map(([l,v]) => ({label:l,latency:Math.round(v.reduce((a,b)=>a+b)/v.length)})).sort((a,b) => parseInt(a.label)-parseInt(b.label)),
        recentLogs: (logs||[]).slice(0,10).map(l => ({message: l.message || `[${l.status}] ${l.latency_ms}ms`, status: l.status, timestamp: l.created_at})),
        totalExecutions: logs?.length || 0,
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch(e) {
    console.error('API Error:', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};
