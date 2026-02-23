import express from "express";

const app = express();
app.use(express.json());

const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;
const HA_NOTIFY_DEVICE = process.env.HA_NOTIFY_DEVICE;
const PORT = parseInt(process.env.PORT || "3004", 10);

if (!HA_URL || !HA_TOKEN || !HA_NOTIFY_DEVICE) {
  console.error("Missing required env vars: HA_URL, HA_TOKEN, HA_NOTIFY_DEVICE");
  process.exit(1);
}

interface AlertmanagerAlert {
  status: "firing" | "resolved";
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt: string;
  generatorURL: string;
}

interface AlertmanagerPayload {
  version: string;
  status: "firing" | "resolved";
  alerts: AlertmanagerAlert[];
}

async function notifyHA(title: string, message: string): Promise<void> {
  const url = `${HA_URL}/api/services/notify/mobile_app_${HA_NOTIFY_DEVICE}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, message }),
  });

  if (!res.ok) {
    console.error(`HA notify failed (${res.status}): ${await res.text()}`);
  }
}

function formatAlert(alert: AlertmanagerAlert): { title: string; message: string } {
  const status = alert.status === "firing" ? "FIRING" : "RESOLVED";
  const alertname = alert.labels.alertname || "Unknown";
  const instance = alert.labels.instance || "unknown";
  const summary = alert.annotations.summary || "";
  const description = alert.annotations.description || "";

  return {
    title: `[${status}] ${alertname}`,
    message: summary || `${alertname} on ${instance} — ${description}`,
  };
}

app.post("/webhook", async (req, res) => {
  const payload = req.body as AlertmanagerPayload;

  if (!payload.alerts || !Array.isArray(payload.alerts)) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  console.log(`Received ${payload.alerts.length} alert(s), status: ${payload.status}`);

  for (const alert of payload.alerts) {
    const { title, message } = formatAlert(alert);
    console.log(`  → ${title}: ${message}`);
    await notifyHA(title, message);
  }

  res.json({ status: "ok", processed: payload.alerts.length });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.listen(PORT, () => {
  console.log(`alert-bridge listening on port ${PORT}`);
});
