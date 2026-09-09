FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends git curl && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y nodejs
# Not published to PyPI, so install from source
RUN git clone --depth 1 https://github.com/aserper/jellyseerr-mcp.git /app
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt
RUN npm install -g supergateway
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["supergateway", "--stdio", "python main.py --transport stdio", "--port", "8000", "--outputTransport", "streamableHttp"]
