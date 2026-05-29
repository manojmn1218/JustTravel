FROM node:20-alpine

WORKDIR /app

# Copy backend package files and install
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Copy prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy backend source and build
COPY backend/ .
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
