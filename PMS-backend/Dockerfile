# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy only production dependencies + built code
COPY --from=builder /app /app

# Expose backend port
EXPOSE 5000

# Use a non-root user for security
USER node

# Start backend
# CMD ["npm", "run", "start:prod"]
CMD ["node", "server.js"]



# # Stage 1: Build
# FROM node:20-alpine AS builder

# WORKDIR /app

# # Copy package files and install production dependencies only
# COPY package*.json ./
# RUN npm install --production

# # Copy source code
# COPY . .

# # If using TypeScript or build step, uncomment:
# # RUN npm run build

# # Stage 2: Production image
# FROM node:20-alpine AS production

# WORKDIR /app

# # Copy app from builder
# COPY --from=builder /app /app

# # Use non-root user for security
# USER node

# # Expose the backend port
# EXPOSE 5000

# # Start the backend using PM2 runtime
# # Replace 'dist/main.js' with your entry point if compiled
# CMD ["npx", "pm2-runtime", "dist/main.js"]
