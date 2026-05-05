FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM node:24

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install --omit=dev

COPY --chown=node:node --from=builder /app/dist ./dist

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]