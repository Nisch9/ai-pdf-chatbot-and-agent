#!/bin/sh

# Generate .env file from environment variables
cat > /app/.env << EOF
GOOGLE_API_KEY=${GOOGLE_API_KEY:-}
GROQ_API_KEY=${GROQ_API_KEY:-}
SUPABASE_URL=${SUPABASE_URL:-}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}
LANGCHAIN_TRACING_V2=${LANGCHAIN_TRACING_V2:-true}
LANGCHAIN_API_KEY=${LANGCHAIN_API_KEY:-}
LANGCHAIN_PROJECT=${LANGCHAIN_PROJECT:-pdf-chatbot}
EOF

# Start the LangGraph server
exec npx @langchain/langgraph-cli dev --host 0.0.0.0 --port 8080
