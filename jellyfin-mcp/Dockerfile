FROM node:24-alpine
WORKDIR /app
# Upstream (lidless-labs/jellyctrl) is WIP and documents breaking changes
# between minor versions, so pin an exact release.
RUN npm install jellyfin-mcp@0.4.3 supergateway
EXPOSE 8000
CMD ["npx", "supergateway", "--stdio", "node node_modules/jellyfin-mcp/dist/mcp-bin.js", "--port", "8000", "--outputTransport", "streamableHttp"]
