FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Set NODE_ENV for npm install (affects whether devDependencies are installed)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
RUN npm install

# Copy source code
COPY . .

# Set defaults for port (runtime only)
ARG PORT=4356
EXPOSE $PORT

# Start the app
CMD ["npm", "start"]
