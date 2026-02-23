FROM node:24-alpine
RUN apk add --no-cache python3 py3-pip
RUN pip3 install --break-system-packages mcp-proxmox
RUN npm install -g supergateway
EXPOSE 8000
CMD ["supergateway", "--streamableHttp", "--port", "8000", "--stdio", "proxmox-mcp"]
