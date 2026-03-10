FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends git curl && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y nodejs
RUN pip install --no-cache-dir git+https://github.com/jmagar/unraid-mcp.git
RUN npm install -g supergateway
EXPOSE 6970
ENV UNRAID_MCP_TRANSPORT=stdio
CMD ["supergateway", "--stdio", "unraid-mcp-server", "--port", "6970", "--outputTransport", "streamableHttp"]
