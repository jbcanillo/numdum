FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set defaults for node environment and port, can be overridden at build time
ARG NODE_ENV=development
ARG PORT=4356
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
EXPOSE $PORT

# Start the app
CMD ["npm", "start"]
