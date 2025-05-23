# Use an official Node.js runtime as a parent image
FROM node:22.13.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN chmod +x node_modules/.bin/tsc

# Build the application
RUN npx tsc

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run the application
CMD ["node", "dist/index.js"]