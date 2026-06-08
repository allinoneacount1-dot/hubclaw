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

    // Add abstract if available
    if (data.Abstract) {
      results.push({
        title: data.AbstractSource || 'Abstract',
        url: data.AbstractURL || 'https://duckduckgo.com',
        snippet: data.Abstract,
      });
    }

    // Add related topics
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
