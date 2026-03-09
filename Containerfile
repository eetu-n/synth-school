FROM node:22-alpine

WORKDIR /app

# Copy the built app from the host machine
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY build ./build

ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["node", "build/index.js"]
