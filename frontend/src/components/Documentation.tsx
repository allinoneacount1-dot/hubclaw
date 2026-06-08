import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface DocumentationProps {
  onBack: () => void;
}

export default function Documentation({ onBack }: DocumentationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', mass: 0.5, damping: 18 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
          borderBottomColor: 'var(--border-color)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Back to Dashboard</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-light mb-4" style={{ color: 'var(--text-primary)' }}>
              HubClaw Documentation
            </h1>
            <p className="text-lg font-mono" style={{ color: 'var(--text-muted)' }}>
              Comprehensive guide to using HubClaw AI Agent Orchestration Platform
            </p>
          </div>

          {/* Section 1: Introduction */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              1. Introduction to HubClaw
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Welcome to HubClaw, the next-generation AI agent orchestration platform designed to streamline your workflow, automate repetitive tasks, and harness the power of multiple AI models working in harmony. Whether you're a developer, data scientist, product manager, or just an AI enthusiast, HubClaw provides you with the tools you need to create, manage, and deploy intelligent agents that can handle a wide variety of tasks—from simple data analysis to complex multi-step workflows that require coordination between multiple specialized AI models.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              At its core, HubClaw is built on the principle of modularity. Each agent is a self-contained unit with its own personality, capabilities, and configuration. You can think of agents as specialized experts that you can call upon to perform specific tasks. But what makes HubClaw truly powerful is its ability to chain these agents together into complex workflows, where the output of one agent becomes the input of another, creating a seamless pipeline of intelligent processing that can tackle problems far beyond the capabilities of any single AI model.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Whether you're looking to automate your customer support, analyze large datasets, generate content, monitor your infrastructure, or any other task that can benefit from AI, HubClaw has you covered. With support for all major AI models including Google Gemini, Anthropic Claude, OpenAI GPT, DeepSeek, xAI Grok, Mistral, and even local models via Ollama, you have the flexibility to choose the right tool for each job. And with our mock AI fallback, you can start building and testing your workflows immediately, even without an internet connection or API keys.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              In this comprehensive documentation, we'll guide you through every aspect of HubClaw, from getting started with your first agent to building complex orchestrations that can handle your most demanding workflows. We'll cover everything from the basics of the user interface to advanced configuration options, best practices, and troubleshooting tips. By the end of this guide, you'll be a HubClaw power user, ready to leverage the full potential of AI agent orchestration in your projects and workflows.
            </p>
          </section>

          {/* Section 2: Getting Started */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              2. Getting Started with HubClaw
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Getting started with HubClaw is easy. The platform is designed to be intuitive and user-friendly, so you can start creating and using agents in minutes, even if you have no prior experience with AI or orchestration tools. In this section, we'll walk you through the process of setting up HubClaw, creating your first agent, and running your first workflow. Let's dive in!
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              2.1 System Requirements
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              HubClaw is built with modern web technologies and runs entirely in your browser, so there's no need to install any software on your computer. All you need is a modern web browser like Chrome, Firefox, Safari, or Edge, and an internet connection (though you can use the mock AI features offline). If you want to use local models via Ollama, you'll need to have Ollama installed and running on your machine, but that's entirely optional—HubClaw works perfectly well with cloud-based models.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              2.2 Accessing HubClaw
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              You can access HubClaw by visiting the URL where it's deployed. If you're running it locally, that's typically http://localhost:5173 or http://localhost:5174. If it's deployed to Vercel or another hosting platform, you'll use the URL provided by that service. When you first open HubClaw, you'll be greeted by our cinematic boot screen, which gives you a taste of the HubClaw experience and gets you excited to start using the platform. After the boot screen completes, you'll land on our beautiful landing page, where you can learn more about HubClaw and then click "Enter Dashboard" to get started.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              2.3 The Dashboard Interface
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The HubClaw dashboard is your command center for all things AI agent orchestration. Let's take a quick tour of the interface so you know where everything is:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li><strong>Top Bar:</strong> The top bar contains the HubClaw logo, a search bar to find agents quickly, and a button to create new agents. It also has a home button that takes you back to the landing page if you ever want to start over.</li>
              <li><strong>Navigation Tabs:</strong> Below the top bar, you'll find navigation tabs for the different sections of HubClaw: Dashboard (where you are now), Global Analytics, Prompt Library, Orchestration, and this Documentation page.</li>
              <li><strong>Agent Grid:</strong> The main area of the dashboard shows all your agents in a beautiful grid layout. Each agent card shows the agent's name, a brief description, and some stats like the number of stars it has. You can click on any agent to open its Command Center and start interacting with it.</li>
            </ul>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              That's the basics of the dashboard interface. As you use HubClaw more, you'll become familiar with all the nooks and crannies, but this should be enough to get you started. Now, let's create your first agent!
            </p>
          </section>

          {/* Section 3: Creating and Managing Agents */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              3. Creating and Managing Agents
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Agents are the heart and soul of HubClaw. Each agent is a specialized AI that you can configure to perform specific tasks. In this section, we'll cover everything you need to know about creating, configuring, and managing agents in HubClaw.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              3.1 Creating Your First Agent
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Creating an agent in HubClaw is a straightforward process. Here's a step-by-step guide:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>Click the "Initialize" button in the top right corner of the dashboard.</li>
              <li>A modal will appear with a form to configure your new agent.</li>
              <li>Fill in the agent's name and a brief description of what it does.</li>
              <li>Choose the AI model engine you want to use (we have a wide variety to choose from!).</li>
              <li>Set the temperature (higher values make the output more creative, lower values make it more deterministic).</li>
              <li>Set the maximum number of tokens the agent can generate in a single response.</li>
              <li>Configure the tools you want the agent to have access to (things like web search, Python sandbox, GitHub repo manager, etc.).</li>
              <li>Write a system prompt that defines the agent's behavior, personality, and constraints (we have some great templates to get you started!).</li>
              <li>Click "Create Agent"—and that's it! Your new agent is ready to use.</li>
            </ol>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Once you've created an agent, it will appear in your dashboard's agent grid. You can click on it at any time to open its Command Center and start interacting with it. And don't worry if you make a mistake—you can always edit an agent's configuration later (though we're still working on that feature, stay tuned!).
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              3.2 Configuring Agent Settings
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Each agent in HubClaw is highly configurable. Here are some of the key settings you can adjust:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li><strong>Model Engine:</strong> This is the AI model that powers your agent. We support all the major players, so you can choose the one that best fits your needs and budget.</li>
              <li><strong>Temperature:</strong> Controls the randomness of the agent's output. A temperature of 0 will make the agent always choose the most likely next token, while higher values up to 2 will make it more creative and unpredictable.</li>
              <li><strong>Max Tokens:</strong> The maximum number of tokens the agent can generate in a single response. This helps you control costs and prevent excessively long outputs.</li>
              <li><strong>Tools:</strong> The tools that the agent has access to. These can include things like web search, Python sandbox for data analysis, GitHub repo manager for interacting with code repositories, Discord webhooks for sending messages, and more.</li>
              <li><strong>System Prompt:</strong> This is the most important part of your agent's configuration. It defines who the agent is, how it should behave, what its constraints are, and how it should respond to different situations. A well-written system prompt is the key to a great agent.</li>
            </ul>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Experiment with these settings to find what works best for your use case. Don't be afraid to tweak things—you can always create a new agent if you want to try a completely different configuration.
            </p>
          </section>

          {/* Section 4: The Command Center */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              4. The Command Center
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The Command Center is where you interact with your agents. It's a beautiful, intuitive interface that lets you chat with your agents, view their responses, configure their settings, manage your conversation history, and more. Let's take a closer look at what the Command Center has to offer.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              4.1 The Live Sandbox Testbed
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The main area of the Command Center is the Live Sandbox Testbed, which is where your conversations with the agent take place. It's a clean, distraction-free interface that lets you focus on the conversation. You can type your messages in the input field at the bottom, hit Enter, and watch as the agent responds. The conversation history is saved automatically, so you can pick up where you left off at any time.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              4.2 The Config Tab
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The Config tab is where you can view and (soon) edit the agent's configuration. It's divided into sections:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li><strong>Model Configuration:</strong> Here you can see which model the agent is using, its temperature, and max tokens setting.</li>
              <li><strong>System Prompt:</strong> This shows the agent's system prompt. You can expand it to see the full prompt and use our templates to modify it.</li>
              <li><strong>Neural Tools:</strong> Here you can see which tools the agent has access to and toggle them on or off.</li>
            </ul>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              4.3 The Queue Tab
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The Queue tab lets you manage a queue of tasks for your agent. You can add tasks with different priorities (urgent, normal, low), and the agent will work through them in order. This is great for batch processing or when you have multiple things you want the agent to do without having to wait for each one to finish.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              4.4 The History Tab
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The History tab is all about conversation branching. If you've ever used Git, you'll feel right at home here. You can create branches from any point in the conversation, explore different paths, and switch between branches easily. This is perfect for when you want to explore different ideas or approaches without losing your original conversation.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              4.5 The Safety Tab
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The Safety tab is where you can configure safety guardrails for your agent. You can set a token budget to control costs, configure content filtering, and set other safety settings to ensure your agent behaves responsibly and stays within your guidelines.
            </p>
          </section>

          {/* Section 5: Analytics */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              5. Global Analytics
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The Global Analytics page gives you a bird's-eye view of how you're using HubClaw. You can see stats like total tokens used, number of conversations, average response time, most active agents, and more. This data is invaluable for understanding your usage patterns, optimizing your workflows, and controlling costs.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The analytics page features beautiful, interactive charts powered by Recharts. You can filter data by date range, agent, model, and more. You can see trends over time, identify your most expensive agents, and find opportunities to optimize your usage. Whether you're a solo developer or part of a large team, the analytics page will help you get the most out of HubClaw.
            </p>
          </section>

          {/* Section 6: Prompt Library */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              6. The Prompt Library
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The Prompt Library is a collection of pre-written system prompts that you can use as a starting point for your own agents. We've carefully crafted prompts for a wide variety of use cases, including data analysis, code review, social media management, research, DevOps, legal document analysis, cryptocurrency analysis, email management, SQL generation, API testing, churn prediction, technical writing, security auditing, meeting summarization, competitive intelligence, talent sourcing, site reliability engineering, content planning, dependency management, support ticket routing, A/B testing analysis, community moderation, release management, knowledge management, and workflow orchestration.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Each prompt in the library is battle-tested and ready to use. You can use them as-is, or modify them to better fit your specific needs. And as you create your own great prompts, you can add them to the library for future use (that's a feature we're working on—stay tuned!).
            </p>
          </section>

          {/* Section 7: Orchestration */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              7. Workflow Orchestration
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              This is where the magic happens. Workflow orchestration allows you to chain multiple agents together into complex pipelines, where the output of one agent becomes the input of another. This lets you tackle problems that are far beyond the capabilities of any single agent. For example, you could have one agent research a topic, another agent summarize the research, a third agent generate content based on the summary, and a fourth agent edit and polish that content—all automatically, with no manual intervention required.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Creating an orchestration is easy. Just go to the Orchestration page, click "Create Pipeline," give your pipeline a name and description, and start adding steps. Each step uses an agent and an input prompt. You can use the output of previous steps in your input prompts by using variables like {'{step_1_output}'}. Once you've created your pipeline, you can run it with a single click and watch as it works through each step automatically.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Orchestrations are incredibly powerful and flexible. You can use them for almost anything—content generation, data processing pipelines, automated research, customer support triage, code review workflows, and much more. The only limit is your imagination!
            </p>
          </section>

          {/* Section 8: Best Practices */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              8. Best Practices
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              To get the most out of HubClaw, here are some best practices we recommend following:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li><strong>Start small:</strong> Don't try to build a complex orchestration right out of the gate. Start with a single agent that does one thing well, and then build from there.</li>
              <li><strong>Write clear system prompts:</strong> Your system prompt is the foundation of your agent. Be clear, specific, and detailed about what you want the agent to do and how you want it to behave.</li>
              <li><strong>Test, test, test:</strong> Always test your agents and orchestrations thoroughly before using them in production. Use the mock AI feature to test without incurring costs.</li>
              <li><strong>Use conversation branching:</strong> Don't be afraid to explore different approaches. The conversation branching feature makes it easy to try different things without losing your original work.</li>
              <li><strong>Monitor your usage:</strong> Keep an eye on the analytics page to understand your usage patterns and control costs.</li>
              <li><strong>Leverage the prompt library:</strong> Our prompt library is a great resource. Use it as a starting point for your own agents, and don't be afraid to modify the prompts to fit your needs.</li>
              <li><strong>Iterate:</strong> AI agents and orchestrations are rarely perfect on the first try. Use the feedback you get to refine your prompts, adjust your settings, and improve your workflows over time.</li>
              <li><strong>Stay organized:</strong> Give your agents and pipelines clear, descriptive names and descriptions. This will make it much easier to find what you're looking for later.</li>
              <li><strong>Have fun:</strong> AI is an incredibly exciting field, and HubClaw is designed to be a joy to use. Experiment, explore, and don't be afraid to try new things!</li>
            </ul>
          </section>

          {/* Section 9: Troubleshooting */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              9. Troubleshooting
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Even with the best software, you might run into issues from time to time. Here are some common problems and how to solve them:
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              9.1 The agent isn't responding
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If your agent isn't responding, first check your internet connection. If you're using a cloud-based model, you need an internet connection. If you're offline, you can still use the mock AI feature. If you are online, try refreshing the page. If that doesn't work, check to make sure your API keys are set up correctly (though if you're using the mock AI, you don't need API keys).
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              9.2 The agent's responses aren't what I expected
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If your agent isn't behaving the way you want, the first thing to check is your system prompt. Make sure it's clear, specific, and detailed. You might also want to try adjusting the temperature—lower values will make the agent more focused and deterministic, while higher values will make it more creative. Experiment with different settings until you find what works best for your use case.
            </p>
            <h3 className="text-xl font-light mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              9.3 I'm getting errors about API limits
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you're getting errors about API limits, that means you've hit the rate limit or token limit for your AI provider. You can either wait for the limit to reset, upgrade your plan, or switch to a different model. You can also use the mock AI feature to test without worrying about limits. And don't forget to use the Safety tab to set a token budget and prevent unexpected costs!
            </p>
          </section>

          {/* Section 10: Conclusion */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light border-b pb-2" style={{ color: 'var(--accent)', borderColor: 'var(--border-color)' }}>
              10. Conclusion and Next Steps
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Congratulations! You've made it through the complete HubClaw documentation. You should now have a solid understanding of what HubClaw is, how it works, and how to use it to create powerful AI agent workflows. But your journey with HubClaw is just beginning—there's so much more to explore and discover!
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Here are some next steps to continue your HubClaw journey:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>Create some agents for your own use cases.</li>
              <li>Experiment with different models and settings.</li>
              <li>Try building a simple orchestration.</li>
              <li>Explore the prompt library and see what prompts inspire you.</li>
              <li>Check out the analytics page to see how you're using HubClaw.</li>
              <li>Join our community (coming soon!) to connect with other HubClaw users, share tips and tricks, and get help.</li>
              <li>Follow us on social media (also coming soon!) to stay up to date with the latest HubClaw news and updates.</li>
            </ul>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We're constantly working to improve HubClaw and add new features. Some of the things we're working on include: the ability to edit existing agents, more tools for agents, better collaboration features, even more AI models, and much more. We're excited to see what you'll build with HubClaw, and we can't wait to hear your feedback!
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Thank you for choosing HubClaw. We believe that AI has the power to change the world for the better, and we're honored that you've chosen HubClaw to be a part of your journey. We can't wait to see what you'll create!
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you have any questions, feedback, or suggestions, we'd love to hear from you. You can reach out to us via GitHub, or through our website (coming soon!). And if you'd like to contribute to HubClaw, we'd be absolutely thrilled—HubClaw is open source, and we welcome contributions of all kinds, from bug reports to feature requests to code contributions.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Once again, welcome to HubClaw. We're so glad you're here. Let's build something amazing together!
            </p>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
              © 2026 HubClaw. All rights reserved.
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Made with ❤️ by the HubClaw team
            </p>
          </footer>
        </motion.div>
      </div>
    </motion.div>
  );
}
