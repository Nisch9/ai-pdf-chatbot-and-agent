import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { Embeddings } from '@langchain/core/embeddings';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  BaseConfigurationAnnotation,
  ensureBaseConfiguration,
} from './configuration.js';

/**
 * Simple deterministic embeddings for development/testing
 * Generates consistent 384-dimensional vectors from text
 * No external API or dependencies needed
 */
class DeterministicEmbeddings extends Embeddings {
  private readonly dimensions = 384;

  constructor() {
    super({});
  }

  private hashString(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private generateVector(text: string): number[] {
    const baseHash = this.hashString(text);
    const vector: number[] = [];

    for (let i = 0; i < this.dimensions; i++) {
      // Generate deterministic values based on text and position
      const seed = baseHash + i * 73856093; // Prime multiplier for better distribution
      const random = Math.sin(seed) * 10000;
      const value = random - Math.floor(random); // Normalize to [0, 1]
      vector.push(value * 2 - 1); // Scale to [-1, 1]
    }

    // Normalize vector to unit length
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map(v => v / norm) : vector;
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map(doc => this.generateVector(doc));
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.generateVector(text);
  }
}

export async function makeSupabaseRetriever(
  configuration: typeof BaseConfigurationAnnotation.State,
  threadId?: string,
): Promise<VectorStoreRetriever> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not defined',
    );
  }

  console.log('Initializing deterministic embeddings (384-dim, no API key needed)...');
  const embeddings = new DeterministicEmbeddings();

  // Test embeddings
  try {
    const testEmbedding = await embeddings.embedDocuments(['test']);
    console.log(`✓ Embeddings initialized. Vector dimension: ${testEmbedding[0].length}`);
  } catch (error) {
    throw new Error(
      `Failed to initialize embeddings: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const supabaseClient = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: process.env.SUPABASE_MATCH_FUNCTION || 'match_documents',
  });

  // Build filter with threadId if provided
  const filter = threadId 
    ? { threadId } // Filter by threadId
    : configuration.filterKwargs;

  return vectorStore.asRetriever({
    k: configuration.k,
    filter,
  });
}

export async function makeRetriever(
  config: RunnableConfig,
  threadId?: string,
): Promise<VectorStoreRetriever> {
  const configuration = ensureBaseConfiguration(config);
  switch (configuration.retrieverProvider) {
    case 'supabase':
      return makeSupabaseRetriever(configuration, threadId);
    default:
      throw new Error(
        `Unsupported retriever provider: ${configuration.retrieverProvider}`,
      );
  }
}
