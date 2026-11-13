FROM node:26-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app
COPY ["rule-server/dist", "./"]
RUN npm install
ENTRYPOINT ["node", "main.js"]
