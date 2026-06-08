import fetch from 'node-fetch';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Search the web using DuckDuckGo API (free, no key required)
 */
export async function searchWeb(query: string, limit = 5): Promise<WebSearchResult[]> {
  try {
    const url = new URL('https://api.duckduckgo.com/');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('no_html', '1');
    url.searchParams.set('skip_disambig', '1');

    const response = await fetch(url.toString());
    const data: any = await response.json();
    const results: WebSearchResult[] = [];

    if (data.Abstract) {
      results.push({
        title: data.AbstractSource || 'Abstract',
        url: data.AbstractURL || 'https://duckduckgo.com',
        snippet: data.Abstract,
      });
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, limit)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(' ').slice(0, 5).join(' '),
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

/**
 * Send a message to Discord via Webhook
 */
export async function sendDiscordWebhook(webhookUrl: string, content: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Discord webhook');
    }

    return true;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

/**
 * GitHub API integration
 */
export async function fetchGitHubRepo(owner: string, repo: string, token?: string) {
  try {
    const headers: any = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!response.ok) throw new Error('GitHub API error');
    return await response.json();
  } catch (error) {
    console.error('GitHub API error:', error);
    return null;
  }
}

export async function fetchGitHubIssues(owner: string, repo: string, token?: string) {
  try {
    const headers: any = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, { headers });
    if (!response.ok) throw new Error('GitHub API error');
    return await response.json();
  } catch (error) {
    console.error('GitHub issues error:', error);
    return [];
  }
}

/**
 * Python Sandbox using Piston (free, no key required)
 */
export async function runPythonCode(code: string) {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        version: '3.10',
        files: [{ name: 'main.py', content: code }],
      }),
    });

    if (!response.ok) throw new Error('Python execution failed');
    const data = await response.json();
    return {
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
      output: data.run?.output || '',
      exitCode: data.run?.code || 0,
    };
  } catch (error) {
    console.error('Python sandbox error:', error);
    return {
      stdout: '',
      stderr: 'Execution failed',
      output: '',
      exitCode: 1,
    };
  }
}
