FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache sqlite

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY mcp-server/package*.json ./mcp-server/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install
RUN cd mcp-server && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Create data directory
RUN mkdir -p /app/data

# Expose ports
EXPOSE 3000 5000 3001

# Start all services
CMD ["npm", "run", "dev"]
