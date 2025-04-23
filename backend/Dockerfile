FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs
USER nodeuser

# App binds to port 5000
EXPOSE 5000

# Define environment variables with default values
ENV NODE_ENV=production \
    PORT=5000

# Run the application
CMD ["node", "src/server.js"]