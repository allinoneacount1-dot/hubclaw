export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  mockAi: process.env.MOCK_AI === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || '',

  // OpenRouter
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openRouterBaseUrl: 'https://openrouter.ai/api/v1',

  // Helius (Solana)
  heliusApiKey: process.env.HELIUS_API_KEY || '',
  heliusBaseUrl: 'https://mainnet.helius-rpc.com',

  // Free tier models (prioritized)
  freeModels: [
    'nvidia/nemotron-4-340b-instruct:free',
    'openrouter/owl-alpha:free',
    'google/gemini-2.0-flash-exp:free',
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.1-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'qwen/qwen-2-7b-instruct:free',
    'deepseek/deepseek-r1:free',
  ],
  defaultFreeModel: 'nvidia/nemotron-4-340b-instruct:free',
};

export default config;
