FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir git+https://github.com/Taxuspt/garmin_mcp.git
# OAuth tokens live here; mount a volume so MFA is only needed once.
RUN mkdir -p /root/.garminconnect && chmod 700 /root/.garminconnect
VOLUME ["/root/.garminconnect"]
# Serves streamable HTTP natively, so no supergateway wrapper is needed.
# GARMIN_MCP_HOST must be 0.0.0.0 to be reachable outside the container;
# upstream defaults to loopback because this transport has no authentication.
ENV PYTHONUNBUFFERED=1 \
    GARMIN_MCP_TRANSPORT=streamable-http \
    GARMIN_MCP_HOST=0.0.0.0 \
    GARMIN_MCP_PORT=8000 \
    GARMIN_FIT_DOWNLOAD_DIR=/data
EXPOSE 8000
# CMD (not ENTRYPOINT) so `docker compose run --rm garmin-mcp garmin-mcp-auth`
# can run the one-time interactive login instead.
CMD ["garmin-mcp"]
