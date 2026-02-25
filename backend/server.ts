import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { graph as retrievalGraph } from './src/retrieval_graph/graph.js';
import { graph as ingestionGraph } from './src/ingestion_graph/graph.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory thread storage (use Redis/DB in production)
const threads: Map<string, { thread_id: string; metadata: Record<string, unknown>; created_at: string }> = new Map();

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'LangGraph API Server' });
});

app.get('/ok', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// List assistants
app.post('/assistants/search', (_req: Request, res: Response) => {
  res.json([
    { assistant_id: 'ingestion_graph', graph_id: 'ingestion_graph', name: 'Ingestion Graph' },
    { assistant_id: 'retrieval_graph', graph_id: 'retrieval_graph', name: 'Retrieval Graph' },
  ]);
});

// Get assistant
app.get('/assistants/:assistantId', (req: Request, res: Response) => {
  const { assistantId } = req.params;
  res.json({ assistant_id: assistantId, graph_id: assistantId, name: assistantId });
});

// Create thread
app.post('/threads', (req: Request, res: Response) => {
  const threadId = req.body?.thread_id || uuidv4();
  const thread = {
    thread_id: threadId,
    metadata: req.body?.metadata || {},
    created_at: new Date().toISOString(),
  };
  threads.set(threadId, thread);
  res.json(thread);
});

// Get thread
app.get('/threads/:threadId', (req: Request, res: Response) => {
  const { threadId } = req.params;
  const thread = threads.get(threadId);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  return res.json(thread);
});

// Get thread state
app.get('/threads/:threadId/state', (_req: Request, res: Response) => {
  return res.json({ values: {}, next: [], tasks: [], metadata: {}, created_at: new Date().toISOString(), parent_config: null });
});

// Run graph (wait mode)
app.post('/threads/:threadId/runs/wait', async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const { input, config, assistant_id } = req.body;

  try {
    const graphConfig = {
      configurable: {
        thread_id: threadId,
        ...config?.configurable,
      },
    };

    let result;
    if (assistant_id === 'ingestion_graph') {
      result = await ingestionGraph.invoke(input, graphConfig);
    } else if (assistant_id === 'retrieval_graph') {
      result = await retrievalGraph.invoke(input, graphConfig);
    } else {
      return res.status(400).json({ error: `Unknown assistant: ${assistant_id}` });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error running graph:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Stream graph
app.post('/threads/:threadId/runs/stream', async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const { input, config, assistant_id, stream_mode } = req.body;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const graphConfig = {
      configurable: {
        thread_id: threadId,
        ...config?.configurable,
      },
    };

    let graph;
    if (assistant_id === 'ingestion_graph') {
      graph = ingestionGraph;
    } else if (assistant_id === 'retrieval_graph') {
      graph = retrievalGraph;
    } else {
      res.write(`data: ${JSON.stringify({ event: 'error', data: { error: `Unknown assistant: ${assistant_id}` } })}\n\n`);
      res.end();
      return;
    }

    // Stream the graph execution
    const streamModes = Array.isArray(stream_mode) ? stream_mode : [stream_mode || 'updates'];
    
    for await (const chunk of await graph.stream(input, { ...graphConfig, streamMode: streamModes[0] })) {
      const eventData = {
        event: streamModes[0],
        data: chunk,
      };
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ event: 'end' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error streaming graph:', error);
    res.write(`data: ${JSON.stringify({ event: 'error', data: { error: error instanceof Error ? error.message : 'Unknown error' } })}\n\n`);
    res.end();
  }
});

// Stateless stream (no thread)
app.post('/runs/stream', async (req: Request, res: Response) => {
  const { input, config, assistant_id, stream_mode } = req.body;
  const threadId = uuidv4();

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const graphConfig = {
      configurable: {
        thread_id: threadId,
        ...config?.configurable,
      },
    };

    let graph;
    if (assistant_id === 'ingestion_graph') {
      graph = ingestionGraph;
    } else if (assistant_id === 'retrieval_graph') {
      graph = retrievalGraph;
    } else {
      res.write(`data: ${JSON.stringify({ event: 'error', data: { error: `Unknown assistant: ${assistant_id}` } })}\n\n`);
      res.end();
      return;
    }

    const streamModes = Array.isArray(stream_mode) ? stream_mode : [stream_mode || 'updates'];
    
    for await (const chunk of await graph.stream(input, { ...graphConfig, streamMode: streamModes[0] })) {
      const eventData = {
        event: streamModes[0],
        data: chunk,
      };
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ event: 'end' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error streaming graph:', error);
    res.write(`data: ${JSON.stringify({ event: 'error', data: { error: error instanceof Error ? error.message : 'Unknown error' } })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`LangGraph API Server running on port ${PORT}`);
});
