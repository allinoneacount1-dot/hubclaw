# HubClaw - AI Agent Orchestration Platform

![HubClaw Logo](frontend/public/logo-hubclaw.svg)

---

## 🚀 Overview

HubClaw is a cutting-edge AI agent orchestration platform designed to streamline your workflow, automate repetitive tasks, and harness the collective power of multiple specialized AI models working in harmony. Whether you're a developer, data scientist, product manager, or AI enthusiast, HubClaw provides an intuitive, developer-first interface to create, configure, and deploy intelligent agent pipelines.

### Key Capabilities
- **Modular Agent Architecture**: Each agent is a self-contained expert with configurable personality, capabilities, and tools
- **Multi-Model Support**: Seamlessly use Google Gemini, Anthropic Claude, OpenAI GPT, DeepSeek, xAI Grok, Mistral, and local Ollama models
- **Workflow Orchestration**: Chain agents together into complex, multi-step pipelines with automatic input/output handling
- **Persistent Conversation History**: All interactions are saved locally with conversation branching and versioning (Git-style)
- **Comprehensive Analytics**: Monitor performance, token usage, latency, and agent activity in beautiful, interactive charts
- **Prompt Library**: Battle-tested system prompts for 30+ common use cases to accelerate your workflow
- **Safety & Cost Control**: Token budgets, content filtering, and usage limits to keep your AI operations secure and affordable
- **Dark & Light Themes**: Beautiful, responsive UI with full theme support and accessibility features

---

## 🛠️ Tech Stack

HubClaw is built with modern, industry-standard technologies:
- **Frontend**: React 19 + TypeScript 5 + Vite 6
- **State Management**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS 4 + CSS Custom Properties
- **Animations**: Framer Motion
- **Charts & Visualization**: Recharts
- **Icons**: Lucide React
- **Build & Deployment**: Vercel-optimized configuration

---

## 📚 Table of Contents

1. [Getting Started](#-getting-started)
2. [Installation](#-installation)
3. [Usage Guide](#-usage-guide)
4. [Core Features](#-core-features)
5. [Deployment](#-deployment)
6. [Project Structure](#-project-structure)
7. [Best Practices](#-best-practices)
8. [Contributing](#-contributing)
9. [License](#-license)

---

## 🚀 Getting Started

Getting started with HubClaw takes less than 5 minutes. Follow these simple steps:

### Prerequisites

- Node.js 18+ or higher
- npm, yarn, or pnpm
- Modern web browser (Chrome 100+, Firefox 100+, Safari 16+, Edge 100+)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/allinoneacount1-dot/hubclaw.git
   cd hubclaw
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173` (or `http://localhost:5174`)

That's it! You're ready to start using HubClaw.

---

## 📦 Installation

### Development Environment

HubClaw supports all major package managers:

**npm**:
```bash
npm install
npm run dev
```

**yarn**:
```bash
yarn install
yarn dev
```

**pnpm**:
```bash
pnpm install
pnpm dev
```

### Production Build

To build HubClaw for production:
```bash
npm run build
```

The built files will be in the `frontend/dist` directory.

To preview the production build:
```bash
npm run preview
```

---

## 📖 Usage Guide

### Boot Sequence

When you first open HubClaw, you will experience our cinematic boot screen, which:
1. Displays the HubClaw logo with animated glow effects
2. Shows boot progress through stages (BIOS Init → Kernel Load → File Systems → Network → HubClaw OS)
3. Features a gradient progress bar with smooth animations
4. Automatically transitions to the landing page after completion

### Landing Page

The landing page is your gateway to HubClaw, featuring:
- Beautiful gradient background with animated glow orbs
- Feature showcase with icons
- Prominent "Enter Dashboard" CTA button
- GitHub repository link
- Clean, minimalist design with the HubClaw branding

### Dashboard Tour

The dashboard is your command center:
1. **Top Bar**: Logo, home button, agent search, and "Initialize" button
2. **Navigation Tabs**:
   - Dashboard (agent grid)
   - Global Analytics
   - Prompt Library
   - Orchestration
   - Documentation
3. **Agent Grid**: Responsive grid showing all your agents with stats
4. **Breadcrumb Navigation**: Clear path indication

### Creating Your First Agent

To create a new agent:

1. Click "Initialize" in the top right corner
2. Fill out the agent configuration form:
   - **Agent Name**: Clear, descriptive name
   - **Description**: Brief explanation of what the agent does
   - **Model Engine**: Choose from Gemini, Claude, GPT, DeepSeek, Grok, Mistral, or Ollama
   - **Temperature**: Controls randomness (0 = deterministic, 2 = very creative)
   - **Max Tokens**: Limit response length to control costs
   - **Tools**: Select from Web Search, Python Sandbox, GitHub Repo Manager, Discord Webhooks
   - **System Prompt**: Define the agent's personality, behavior, and constraints (use templates!)
3. Click "Create Agent"

Your new agent will appear in the dashboard grid, ready to use!

### Using the Command Center

Click on any agent to open its Command Center, where you can:
- **Live Sandbox**: Chat with the agent and view real-time responses
- **Config Tab**: View and (soon) edit agent settings
- **Queue Tab**: Manage task queues with priority levels
- **History Tab**: Explore conversation branches
- **Safety Tab**: Configure safety guardrails and token budgets

### Building Orchestrations

The Orchestration page lets you chain agents together:

1. Click "Create Pipeline"
2. Give your pipeline a name and description
3. Add steps by selecting agents and defining inputs
4. Use `{{step_X_output}}` variables to pass data between steps
5. Click "Run Pipeline" to execute automatically

---

## ✨ Core Features

### 1. Cinematic Boot Sequence
- OS-style boot animation with logo reveal
- Staged boot messages with smooth transitions
- Gradient progress bar with animated shimmer effect
- Persistent state (only runs once per session)

### 2. Multi-Agent Orchestration
- Visual pipeline builder
- Automatic output/input chaining
- Step-by-step execution with feedback
- Pipeline management (create, delete, run)

### 3. Comprehensive Analytics
- Token usage tracking and forecasting
- Response time/latency metrics
- Agent activity and popularity
- Beautiful Recharts visualizations
- Date range filtering

### 4. Prompt Library
- 30+ pre-written, battle-tested system prompts
- Use cases from data analysis to community moderation
- Fully customizable and extendable
- One-click application to new agents

### 5. Conversation Branching
- Git-style conversation versioning
- Create branches from any point in the chat
- Switch between branches seamlessly
- Perfect for exploring multiple approaches

### 6. Safety & Cost Control
- Configurable token budgets
- Content filtering (coming soon)
- Usage alerts and limits
- Safety guardrails configuration

### 7. Theme Support
- Dark theme (default, optimized for developers)
- Light theme (for bright environments)
- CSS Custom Properties for easy customization
- Smooth theme transitions

### 8. Responsive Design
- Mobile-first approach
- Works perfectly on phones, tablets, and desktops
- Touch-friendly interface
- Adaptive layouts for all screen sizes

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

HubClaw is optimized for Vercel deployment with zero configuration:

1. Push your code to GitHub
2. Log in to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your `allinoneacount1-dot/hubclaw` repository
5. Set **Root Directory** to `frontend`
6. Click "Deploy"

That's it! Your HubClaw instance will be live in seconds.

### Manual Deployment

You can deploy HubClaw to any static hosting service:

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist` directory to your hosting provider (Netlify, Cloudflare Pages, AWS S3, etc.)

---

## 📁 Project Structure

```
hubclaw/
├── frontend/                      # Main application directory
│   ├── public/                    # Static assets
│   │   ├── favicon.svg            # Custom favicon
│   │   └── logo-hubclaw.svg       # Main HubClaw logo
│   ├── src/                       # Source code
│   │   ├── components/            # React components
│   │   │   ├── AgentCard.tsx      # Agent card display component
│   │   │   ├── AnalyticsView.tsx  # Global analytics dashboard
│   │   │   ├── BootScreen.tsx     # Cinematic boot animation
│   │   │   ├── Breadcrumb.tsx     # Breadcrumb navigation
│   │   │   ├── CommandCenter.tsx  # Agent interaction interface
│   │   │   ├── CreateAgentModal.tsx # Agent creation form
│   │   │   ├── Dashboard.tsx      # Main dashboard page
│   │   │   ├── Documentation.tsx  # Documentation page (10k+ chars)
│   │   │   ├── LandingPage.tsx    # Landing/home page
│   │   │   ├── OrchestrationPage.tsx # Pipeline builder
│   │   │   ├── PromptLibrary.tsx  # Prompt library
│   │   │   ├── Skeleton.tsx       # Loading skeletons
│   │   │   ├── ThemeToggle.tsx    # Dark/light theme switcher
│   │   │   └── Toast.tsx          # Notification system
│   │   ├── services/              # API and service layer
│   │   ├── store.ts               # Zustand global state
│   │   ├── App.tsx                # Main app component & routing
│   │   ├── index.css              # Global styles & theme
│   │   └── main.tsx               # App entry point
│   ├── package.json               # Dependencies and scripts
│   ├── tsconfig.json              # TypeScript config
│   ├── vite.config.ts             # Vite config
│   └── vercel.json                # Vercel deployment config
├── CHAT_DOCUMENTATION.md          # Extra chat documentation
└── README.md                      # This file
```

---

## 🌟 Best Practices

To get the most out of HubClaw:

1. **Start Small**: Begin with a single, focused agent before building complex orchestrations
2. **Invest in System Prompts**: A well-written system prompt is the foundation of a great agent
3. **Test with Mock AI**: Use the built-in mock AI to test workflows without incurring costs
4. **Use Conversation Branching**: Explore different approaches without losing your original work
5. **Monitor Analytics**: Keep an eye on usage to optimize costs and performance
6. **Leverage the Prompt Library**: Our templates are battle-tested and ready to use
7. **Iterate**: AI agents improve with feedback—refine your prompts and settings over time
8. **Stay Organized**: Use clear names and descriptions for agents and pipelines

---

## 🤝 Contributing

We welcome contributions of all kinds! Here's how you can help:

1. **Report Bugs**: Use GitHub Issues to report problems
2. **Request Features**: Share your ideas for new functionality
3. **Submit Pull Requests**: Fix bugs, add features, improve documentation
4. **Improve Documentation**: Help us make our docs even better
5. **Spread the Word**: Tell your friends and colleagues about HubClaw

### Development Guidelines

- Follow the existing code style and conventions
- Write TypeScript with strict type checking enabled
- Keep components focused and modular
- Use meaningful commit messages
- Test your changes thoroughly

---

## 📄 License

HubClaw is open-source software released under the MIT License. See the LICENSE file for more details.

---

## 💬 Contact

- **GitHub Repository**: [https://github.com/allinoneacount1-dot/hubclaw](https://github.com/allinoneacount1-dot/hubclaw)
- **Issues & Feature Requests**: [GitHub Issues](https://github.com/allinoneacount1-dot/hubclaw/issues)

---

## 🙏 Acknowledgments

- Built with ❤️ by the HubClaw team
- Powered by amazing AI models from Google, Anthropic, OpenAI, and others
- Inspired by the developer community's passion for AI automation

---

**Thank you for choosing HubClaw!** We're excited to see what you'll build.
