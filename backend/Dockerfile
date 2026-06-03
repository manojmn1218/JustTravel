FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Expose port
EXPOSE 4000

# Start: push schema to DB, run seed, then run server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run prisma:seed && node dist/server.js"]
