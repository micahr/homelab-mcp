FROM node:24-alpine
WORKDIR /app
RUN npm install mcp-pihole-server supergateway
EXPOSE 8000
CMD ["npx", "supergateway", "--sse", "--port", "8000", "--stdio", "node node_modules/mcp-pihole-server/dist/index.js"]
