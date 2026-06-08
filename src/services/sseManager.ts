// SSE Manager for broadcasting real-time updates
import type { Request, Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
  userId: string;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  addClient(userId: string, res: Response): string {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    this.clients.set(clientId, { id: clientId, res, userId });
    
    // Send welcome message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    
    // Handle client disconnect
    res.on('close', () => {
      this.removeClient(clientId);
    });
    
    return clientId;
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  broadcastToUser(userId: string, event: string, data: any): void {
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        try {
          client.res.write(`event: ${event}\n`);
          client.res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (err) {
          console.error('Failed to send SSE to client:', err);
          this.removeClient(client.id);
        }
      }
    });
  }

  broadcast(event: string, data: any): void {
    this.clients.forEach((client) => {
      try {
        client.res.write(`event: ${event}\n`);
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        console.error('Failed to send SSE to client:', err);
        this.removeClient(client.id);
      }
    });
  }
}

export const sseManager = new SSEManager();
