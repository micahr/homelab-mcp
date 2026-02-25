FROM node:24-alpine
WORKDIR /app
RUN npm install mcp-arr-server supergateway
EXPOSE 8000
CMD ["npx", "supergateway", "--stdio", "node node_modules/mcp-arr-server/dist/index.js", "--port", "8000", "--outputTransport", "streamableHttp"]
