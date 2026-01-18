# Dockerfile for Cloudflare Workers deployment
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install wrangler globally
RUN npm install -g wrangler

# The actual deployment happens via wrangler deploy
# This Dockerfile is mainly for building
CMD ["node", "--version"]
