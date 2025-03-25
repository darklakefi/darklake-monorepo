FROM node:20-alpine3.20

RUN npm install -g corepack@latest
RUN corepack enable pnpm

WORKDIR /app

COPY pnpm-*.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY .prettierrc ./

COPY apps ./apps

EXPOSE 3000

RUN pnpm install --frozen-lockfile
RUN pnpm build:server

CMD ["node", "apps/server/dist/src/main"]
