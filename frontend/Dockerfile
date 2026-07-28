FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80