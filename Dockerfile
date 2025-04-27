# Stage 1: Build the Vite frontend
FROM node:18-alpine AS build
 
WORKDIR /app
 
# Copy package files from curasure folder
COPY curasure/package*.json ./
RUN npm install
 
# Copy all frontend source code
COPY curasure/ ./
RUN npm run build
 
# Stage 2: Serve with NGINX
FROM nginx:stable-alpine
 
# Copy built frontend files from build stage
COPY --from=build /app/dist /usr/share/nginx/html/curasure
 
# Copy nginx.conf from root
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 80
 
CMD ["nginx", "-g", "daemon off;"]