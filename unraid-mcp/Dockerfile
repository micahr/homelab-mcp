FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir git+https://github.com/jmagar/unraid-mcp.git
EXPOSE 6970
ENV UNRAID_MCP_HOST=0.0.0.0
ENV UNRAID_MCP_PORT=6970
ENV UNRAID_MCP_TRANSPORT=streamable-http
CMD ["unraid-mcp-server"]
