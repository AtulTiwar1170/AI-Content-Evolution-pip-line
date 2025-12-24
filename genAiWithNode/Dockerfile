# Use Node 20 (LTS) to fix ReferenceError: File is not defined
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Node port
EXPOSE 3000

CMD ["node", "src/server.js"]
# CMD ["npm", "run", "dev"]