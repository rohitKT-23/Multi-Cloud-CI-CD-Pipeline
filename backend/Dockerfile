FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install production dependencies (make sure dotenv is in "dependencies")
RUN npm install

# Bundle app source
COPY . .

# Copy .env file if it exists (optional, comment out if you set env via CLI)
# COPY .env .env

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs
USER nodeuser

# App binds to port 5000
EXPOSE 5000

# Define environment variables with default values (can be overridden at runtime)
ENV NODE_ENV=production \
    PORT=5000

# Run the application
CMD ["node", "src/server.js"]
