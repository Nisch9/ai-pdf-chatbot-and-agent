import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentStateAnnotation } from './state.js';
import { makeRetriever } from '../shared/retrieval.js';
import { formatDocs } from './utils.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { ROUTER_SYSTEM_PROMPT } from './prompts.js';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  AgentConfigurationAnnotation,
  ensureAgentConfiguration,
} from './configuration.js';
import { loadChatModel } from '../shared/utils.js';

async function checkQueryType(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<{
  route: 'retrieve' | 'direct';
}> {
  //schema for routing
  const schema = z.object({
    route: z.enum(['retrieve', 'direct']),
    directAnswer: z.string().optional(),
  });

  const configuration = ensureAgentConfiguration(config);
  const model = await loadChatModel(configuration.queryModel);

  const routingPrompt = ROUTER_SYSTEM_PROMPT;

  const formattedPrompt = await routingPrompt.invoke({
    query: state.query,
  });

  const response = await model
    .withStructuredOutput(schema)
    .invoke(formattedPrompt.toString());

  const route = response.route;

  return { route };
}

async function answerQueryDirectly(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const configuration = ensureAgentConfiguration(config);
  const model = await loadChatModel(configuration.queryModel);
  const userHumanMessage = new HumanMessage(state.query);
  
  // Groq requires messages to have a type property
  // Manually set it to ensure compatibility
  (userHumanMessage as any).type = 'human';

  const response = await model.invoke([userHumanMessage]);
  return { messages: [userHumanMessage, response] };
}

async function routeQuery(
  state: typeof AgentStateAnnotation.State,
): Promise<'retrieveDocuments' | 'directAnswer'> {
  const route = state.route;
  if (!route) {
    throw new Error('Route is not set');
  }

  if (route === 'retrieve') {
    return 'retrieveDocuments';
  } else if (route === 'direct') {
    return 'directAnswer';
  } else {
    throw new Error('Invalid route');
  }
}

async function retrieveDocuments(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const retriever = await makeRetriever(config, state.threadId);
  const response = await retriever.invoke(state.query);

  return { documents: response };
}

async function generateResponse(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const configuration = ensureAgentConfiguration(config);
  const context = formatDocs(state.documents);
  const model = await loadChatModel(configuration.queryModel);

  // Build the system prompt with context and question
  const systemContent = `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
    
    question:
    ${state.query}
    
    context:
    ${context}`;

  // Create system message
  const systemMessage = new SystemMessage(systemContent);
  // Groq requires messages to have a type property
  (systemMessage as any).type = 'system';
  
  // Create current query message
  const humanMessage = new HumanMessage(state.query);
  // Groq requires messages to have a type property
  (humanMessage as any).type = 'human';

  // Build message history for this response generation
  // Only include previously valid messages that are proper LangChain message instances
  // Filter out any plain objects or malformed messages and manually set type property
  const validPreviousMessages = (state.messages || []).filter(
    msg => msg && typeof msg === 'object'
  ).map(msg => {
    const anyMsg = msg as any;
    // Ensure type property is set for Groq compatibility
    if (!anyMsg.type) {
      // Try to guess the message type from the message structure
      if (anyMsg.lc_name === 'HumanMessage' || (anyMsg.content && !anyMsg.content.startsWith('system:'))) {
        anyMsg.type = 'human';
      } else if (anyMsg.lc_name === 'AIMessage') {
        anyMsg.type = 'ai';
      } else if (anyMsg.lc_name === 'SystemMessage') {
        anyMsg.type = 'system';
      } else {
        // Default to human if we can't determine the type
        anyMsg.type = 'human';
      }
    }
    return msg;
  });

  // Build message array: previous valid messages + system + human message
  const messageHistory = [...validPreviousMessages, systemMessage, humanMessage];

  // Invoke model with properly typed messages
  const response = await model.invoke(messageHistory);

  // Return the response to be handled by MessagesAnnotation's reducer
  return { messages: [humanMessage, response] };
}

const builder = new StateGraph(
  AgentStateAnnotation,
  AgentConfigurationAnnotation,
)
  .addNode('retrieveDocuments', retrieveDocuments)
  .addNode('generateResponse', generateResponse)
  .addNode('checkQueryType', checkQueryType)
  .addNode('directAnswer', answerQueryDirectly)
  .addEdge(START, 'checkQueryType')
  .addConditionalEdges('checkQueryType', routeQuery, [
    'retrieveDocuments',
    'directAnswer',
  ])
  .addEdge('retrieveDocuments', 'generateResponse')
  .addEdge('generateResponse', END)
  .addEdge('directAnswer', END);

export const graph = builder.compile().withConfig({
  runName: 'RetrievalGraph',
});
