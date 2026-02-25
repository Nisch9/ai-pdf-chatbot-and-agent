import { Client } from '@langchain/langgraph-sdk';
import { LangGraphBase } from './langgraph-base';

// Server client singleton instance
let clientInstance: LangGraphBase | null = null;

/**
 * Creates or returns a singleton instance of the LangGraph client for server-side use
 * @returns LangGraph Client instance or null if env vars are missing
 */
export const createServerClient = (): LangGraphBase | null => {
  if (clientInstance) {
    return clientInstance;
  }

  const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL;
  const apiKey = process.env.LANGCHAIN_API_KEY;

  if (!apiUrl) {
    console.error('NEXT_PUBLIC_LANGGRAPH_API_URL is not set');
    return null;
  }

  if (!apiKey) {
    console.error('LANGCHAIN_API_KEY is not set');
    return null;
  }

  const client = new Client({
    apiUrl,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
  });

  clientInstance = new LangGraphBase(client);
  return clientInstance;
};

// Export all methods from the base class instance
export const langGraphServerClient = createServerClient();
