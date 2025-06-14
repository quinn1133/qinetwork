FROM node:22.16.0-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies as root
RUN npm install

# Add node user and set permissions
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["npm", "start"]