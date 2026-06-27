FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/

# Set environment variables
ENV PORT=8080
ENV JWT_SECRET=super_secret_ticket_system_key_2026
ENV DATABASE_URL=./database.sqlite

EXPOSE 8080

CMD [ "node", "src/app.js" ]
