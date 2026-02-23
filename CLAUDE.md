# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Homelab automation stack — Docker Compose deployment managing MCP servers, monitoring, alerting, and auto-remediation for a Proxmox + Unraid + UniFi homelab. Everything runs on a single Docker-capable LXC on Proxmox.

## Build Commands

```bash
docker compose config          # validate compose file
docker compose up -d           # start all services
docker compose logs -f <svc>   # tail logs for a service
docker compose down            # stop all services
```

### Custom services (alert-bridge, immich-poller)

```bash
cd alert-bridge && npm install && npm run build
cd immich-poller && npm install && npm run build
```

No test runner or linter is configured.

## Architecture

### MCP Servers (community projects, run via Docker)

- **proxmox-mcp** (port 3001) — [bsahane/mcp-proxmox](https://github.com/bsahane/mcp-proxmox), ~40 tools
- **unraid-mcp** (port 3002) — [jmagar/unraid-mcp](https://github.com/jmagar/unraid-mcp), 76+ actions
- **unifi-mcp** (port 3003) — [sirkirby/unifi-network-mcp](https://github.com/sirkirby/unifi-network-mcp), 86 tools
- **ha-mcp** (port 3005) — [homeassistant-ai/ha-mcp](https://github.com/homeassistant-ai/ha-mcp), Home Assistant control
- **arr-mcp** (port 3006) — [mcp-arr](https://github.com/aplaceforallmystuff/mcp-arr) via supergateway, Sonarr/Radarr/Prowlarr
- **pihole-mcp** (port 3007) — [mcp-pihole](https://github.com/aplaceforallmystuff/mcp-pihole) via supergateway, Pi-hole DNS

Claude Desktop connects to these via `http://<lxc-ip>:<port>/mcp`.

### Monitoring Stack

- **Prometheus** (9090) — scrapes pve-exporter, node-exporter, unpoller
- **Grafana** (3000) — auto-provisioned Prometheus datasource; import dashboards 10347, 11315, 1860
- **Alertmanager** (9093) — routes alerts to alert-bridge webhook
- **pve-exporter** (9221) — Proxmox VE metrics
- **node-exporter** (9100) — host metrics
- **unpoller** (9130) — UniFi metrics

### Custom Services

- **alert-bridge** (3004) — TypeScript/Express, translates Alertmanager JSON → HA mobile notifications
- **n8n** (5678) — workflow automation with pre-built remediation workflows
- **immich-poller** — polls Immich health API, updates HA sensor, notifies on failures

### Home Assistant Automations

YAML automations in `homeassistant/automations.yaml` for VM monitoring, WAN status, and daily summaries.

## Tech Stack

- Docker Compose for orchestration
- TypeScript (strict, ES2022 modules) for custom services
- Community MCP servers (Python, TypeScript)
- Prometheus/Grafana for monitoring
- n8n for workflow automation
- Home Assistant REST API for notifications

## Env Vars

All environment variables are documented in `.env.example`. Copy to `.env` and fill in before running.
