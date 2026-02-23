FROM node:24-alpine
RUN apk add --no-cache python3 py3-pip git
RUN pip3 install --break-system-packages proxmoxer requests urllib3 mcp pyyaml
RUN pip3 install --break-system-packages --no-deps git+https://github.com/bsahane/mcp-proxmox.git
RUN npm install -g supergateway
EXPOSE 8000
CMD ["supergateway", "--streamableHttp", "--port", "8000", "--stdio", "proxmox-mcp"]
