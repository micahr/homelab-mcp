FROM node:24-alpine
WORKDIR /app
# Upstream (lidless-labs/jellyctrl) is WIP and documents breaking changes
# between minor versions, so pin an exact release.
RUN npm install jellyfin-mcp@0.4.3 supergateway
# Shim works around a duplicate-initialize-response bug in 0.4.3 that crashes supergateway.
COPY dedupe.mjs /app/dedupe.mjs
EXPOSE 8000
CMD ["npx", "supergateway", "--stdio", "node dedupe.mjs", "--port", "8000", "--outputTransport", "streamableHttp", "--stateful", "--sessionTimeout", "240000"]