FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl git && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y nodejs
RUN pip install --no-cache-dir proxmoxer requests urllib3 mcp pyyaml \
    && pip install --no-cache-dir --no-deps git+https://github.com/bsahane/mcp-proxmox.git
RUN npm install -g supergateway
EXPOSE 8000
CMD ["supergateway", "--streamableHttp", "--port", "8000", "--stdio", "proxmox-mcp"]
