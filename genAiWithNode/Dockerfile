# Use the stable Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Your app listens on port 3000
EXPOSE 3000

# Start the server
CMD ["node", "src/server.js"]