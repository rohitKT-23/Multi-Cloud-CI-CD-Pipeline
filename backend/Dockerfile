# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the entire project
COPY . .

# Expose port
EXPOSE 5000

# Run the server
CMD ["npm", "run", "dev"]
