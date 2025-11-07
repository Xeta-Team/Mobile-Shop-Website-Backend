# --- Stage 1: Build ---
# Use an official Node.js image as the base for building the app
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
# This leverages Docker's cache. These layers only rebuild if package files change.
COPY package.json package-lock.json ./

# Install dependencies using 'npm ci' for a clean, reproducible install
RUN npm ci

# Copy the rest of your application's source code
COPY . .

# Run the build script defined in your package.json
# This will create the /app/dist folder with your static files
RUN npm run build

# --- Stage 2: Serve ---
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.27-alpine

# Copy the built static files from the 'builder' stage to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove the default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration file
# This file is necessary to handle client-side routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80 (the default Nginx port)
EXPOSE 80

# The default command for the Nginx image is to start the server.
# We'll add this for clarity.
CMD ["nginx", "-g", "daemon off;"]