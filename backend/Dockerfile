FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start LangGraph server via entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]