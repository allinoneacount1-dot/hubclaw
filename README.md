# HubClaw - GitHub for AI Agents

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run database schema
# Run schema.sql in your Supabase SQL Editor

# 4. Start development server
npm run dev

# 5. Test
curl http://localhost:3001/api/health
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | development/production |
| `MOCK_AI` | No | Use mock responses (default: true) |
| `CORS_ORIGIN` | No | CORS origin (default: *) |
| `ALLOW_ANON` | No | Allow unauthenticated requests |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/agents` | List all agents |
| GET | `/api/agents/:id` | Get agent by ID |
| POST | `/api/agents` | Create new agent |
| POST | `/api/agents/:id/fork` | Fork an agent |
| POST | `/api/run` | Execute agent |
| GET | `/api/analytics` | Global analytics |
| GET | `/api/analytics/:agentId` | Per-agent analytics |

## Deploy to Vercel

```bash
vercel
vercel --prod
```
