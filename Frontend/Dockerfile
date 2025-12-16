# # Use nginx to serve React build
# FROM nginx:alpine

# # Remove default nginx html
# RUN rm -rf /usr/share/nginx/html/*

# # Copy React build files
# COPY build /usr/share/nginx/html

# # Expose port 80 inside container
# EXPOSE 80

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]


# build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install base dependencies
RUN npm install --legacy-peer-deps

# Install MUI dependencies
RUN npm install @mui/material @emotion/react @emotion/styled @mui/icons-material --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# serve stage
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*

# Create /pms folder
RUN mkdir -p /usr/share/nginx/html/pms

# Copy build into /pms
COPY --from=build /app/build /usr/share/nginx/html/pms
# Copy custom nginx config if you have one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
