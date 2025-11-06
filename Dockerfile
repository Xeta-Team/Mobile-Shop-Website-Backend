# Use an official Node.js runtime as a parent image
# Using 'alpine' for a smaller image size
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Your app runs on port 5000 (seen in your index.js)
EXPOSE 5000

# Define the command to run your app
CMD [ "npm", "start" ]