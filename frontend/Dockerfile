# Use Node.js as base image
FROM node:18

# Set working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the server using serve
CMD ["serve", "-s", ".", "-p", "3000"]