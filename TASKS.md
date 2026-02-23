# Homelab Automation — Task Tracker

## Context

This project builds a homelab monitoring and auto-remediation system. The hub is Home Assistant (HA), with Proxmox (VMs/LXCs), Unraid (NAS/Docker), and Ubiquiti (networking) as targets. Notifications go through the **Home Assistant mobile app**.

Everything runs on a **single Docker-capable LXC on Proxmox** via `docker-compose.yml`.

---

## Completed

### MCP Servers
- [x] **Proxmox MCP** — adopted [bsahane/mcp-proxmox](https://github.com/bsahane/mcp-proxmox) (~40 tools), runs on port 3001
- [x] **Unraid MCP** — adopted [jmagar/unraid-mcp](https://github.com/jmagar/unraid-mcp) (76+ actions), runs on port 3002
- [x] **UniFi MCP** — adopted [sirkirby/unifi-network-mcp](https://github.com/sirkirby/unifi-network-mcp) (86 tools), runs on port 3003
- [x] Original custom Proxmox MCP server superseded and removed

### Monitoring Stack
- [x] **Prometheus** with scrape configs for pve-exporter, node-exporter, unpoller
- [x] **Grafana** with auto-provisioned Prometheus datasource and dashboard import instructions (10347, 11315, 1860)
- [x] **Alertmanager** routing to alert-bridge webhook
- [x] **pve-exporter** for Proxmox metrics
- [x] **node-exporter** for host metrics
- [x] **unpoller** for UniFi metrics
- [x] Alerting rules: NodeCpuHigh, NodeMemoryHigh, DiskUsageHigh, VMDown

### Alertmanager → Home Assistant Bridge
- [x] **alert-bridge** TypeScript/Express service with Dockerfile
- [x] Translates Alertmanager webhook payloads to HA mobile app notifications

### Auto-Remediation Workflows (n8n)
- [x] **VM Auto-Restart** — webhook trigger → Proxmox API start → HA notify
- [x] **Docker Container Restart** — scheduled poll → Unraid GraphQL → restart stopped → HA notify
- [x] **Disk Temp Alert** — webhook trigger → HA notify with disk + temp

### Home Assistant Automations
- [x] VM unavailable notification
- [x] WAN down notification with optional router restart
- [x] Daily homelab summary at 8am

### Immich Health Poller
- [x] Polls Immich `/api/server/statistics` and `/api/jobs`
- [x] Updates `sensor.immich_health` in HA (healthy/degraded/error)
- [x] Notifies via HA mobile app on failures
- [x] Runs on configurable interval (default 5min)

### Infrastructure
- [x] Master `docker-compose.yml` with all services
- [x] `.env.example` with all env vars documented
- [x] README with architecture diagram and setup instructions

---

## Remaining / Future

- [ ] Deploy stack to LXC and verify all services start
- [ ] Update Prometheus placeholder IPs with real infrastructure IPs
- [ ] Update HA automation entity IDs with real entities
- [ ] Import n8n workflows and configure credentials
- [ ] Import Grafana dashboards (10347, 11315, 1860)
- [ ] Test alert-bridge end-to-end with a test alert
- [ ] Set up HA long-lived access token for services
- [ ] Push repo to GitHub
- [ ] Consider adding Uptime Kuma for external endpoint monitoring
- [ ] Consider adding Loki for centralized log aggregation
