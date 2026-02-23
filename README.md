# Homelab Automation Stack

Full-stack homelab monitoring and automation system running on a single Docker-capable LXC on Proxmox. Manages Proxmox VE, Unraid NAS, UniFi networking, and Home Assistant through MCP servers, Prometheus monitoring, automated remediation, and Home Assistant notifications.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Docker LXC on Proxmox                                  │
│                                                         │
│  MCP Servers (Claude Desktop connects via HTTP)         │
│  ├── proxmox-mcp    :3001  ← bsahane/mcp-proxmox       │
│  ├── unraid-mcp     :3002  ← jmagar/unraid-mcp         │
│  ├── unifi-mcp      :3003  ← sirkirby/unifi-network-mcp│
│  ├── ha-mcp         :3005  ← homeassistant-ai/ha-mcp   │
│  ├── arr-mcp        :3006  ← mcp-arr via supergateway  │
│  └── pihole-mcp     :3007  ← mcp-pihole via supergateway│
│                                                         │
│  Monitoring                                             │
│  ├── prometheus      :9090  ← scrapes exporters         │
│  ├── grafana         :3000  ← dashboards                │
│  ├── alertmanager    :9093  ← routes to alert-bridge    │
│  ├── pve-exporter    :9221  ← Proxmox metrics           │
│  ├── node-exporter   :9100  ← host metrics              │
│  └── unpoller        :9130  ← UniFi metrics             │
│                                                         │
│  Custom Services                                        │
│  ├── alert-bridge    :3004  ← Alertmanager → HA notify  │
│  ├── n8n             :5678  ← auto-remediation          │
│  └── immich-poller          ← health checks → HA        │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

1. **Clone and configure:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual IPs, tokens, and credentials
   ```

2. **Update Prometheus targets:**
   Edit `monitoring/prometheus/prometheus.yml` and replace placeholder IPs with your Proxmox host IP.

3. **Start the stack:**
   ```bash
   docker compose up -d
   ```

4. **Configure Claude Desktop** (`~/.config/claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "proxmox":        { "url": "http://<lxc-ip>:3001/mcp" },
       "unraid":         { "url": "http://<lxc-ip>:3002/mcp" },
       "unifi":          { "url": "http://<lxc-ip>:3003/mcp" },
       "home-assistant": { "url": "http://<lxc-ip>:3005/mcp" },
       "arr":            { "url": "http://<lxc-ip>:3006/mcp" },
       "pihole":         { "url": "http://<lxc-ip>:3007/mcp" }
     }
   }
   ```

5. **Set up Grafana dashboards:**
   Open Grafana at `http://<lxc-ip>:3000`, go to Dashboards → Import, and enter IDs:
   - `10347` — Proxmox VE
   - `11315` — UniFi
   - `1860` — Node Exporter

6. **Import n8n workflows:**
   Open n8n at `http://<lxc-ip>:5678`, import JSONs from `n8n/workflows/`.

7. **Add HA automations:**
   Copy `homeassistant/automations.yaml` entries into your Home Assistant config and update entity IDs.

## Services

| Service | Port | Purpose |
|---|---|---|
| proxmox-mcp | 3001 | MCP server for Proxmox VE (~40 tools) |
| unraid-mcp | 3002 | MCP server for Unraid (76+ actions) |
| unifi-mcp | 3003 | MCP server for UniFi (86 tools) |
| ha-mcp | 3005 | MCP server for Home Assistant |
| arr-mcp | 3006 | MCP server for Sonarr/Radarr/Prowlarr |
| pihole-mcp | 3007 | MCP server for Pi-hole DNS |
| grafana | 3000 | Dashboards |
| prometheus | 9090 | Metrics collection |
| alertmanager | 9093 | Alert routing |
| alert-bridge | 3004 | Alertmanager → HA notifications |
| n8n | 5678 | Workflow automation |
| pve-exporter | 9221 | Proxmox metrics exporter |
| node-exporter | 9100 | Host metrics exporter |
| unpoller | 9130 | UniFi metrics exporter |
| immich-poller | — | Immich health → HA sensor |

## Directory Structure

```
homelab/
├── docker-compose.yml
├── .env.example
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   └── alerting_rules.yml
│   ├── alertmanager/
│   │   └── alertmanager.yml
│   └── grafana/provisioning/
│       ├── datasources/prometheus.yml
│       └── dashboards/dashboards.yml
├── alert-bridge/          # Alertmanager → HA bridge
├── immich-poller/         # Immich health checker
├── n8n/workflows/         # Auto-remediation workflows
└── homeassistant/         # HA automation YAML
```
