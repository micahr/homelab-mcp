const IMMICH_URL = process.env.IMMICH_URL;
const IMMICH_API_KEY = process.env.IMMICH_API_KEY;
const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;
const HA_NOTIFY_DEVICE = process.env.HA_NOTIFY_DEVICE;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_SECONDS || "300", 10) * 1000;

if (!IMMICH_URL || !IMMICH_API_KEY || !HA_URL || !HA_TOKEN || !HA_NOTIFY_DEVICE) {
  console.error("Missing required env vars: IMMICH_URL, IMMICH_API_KEY, HA_URL, HA_TOKEN, HA_NOTIFY_DEVICE");
  process.exit(1);
}

interface ImmichJobStatus {
  jobCounts: {
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    waiting: number;
    paused: number;
  };
  queueStatus: {
    isActive: boolean;
    isPaused: boolean;
  };
}

interface ImmichStats {
  photos: number;
  videos: number;
  usage: number;
  usageByUser: Array<{
    userId: string;
    photos: number;
    videos: number;
    usage: number;
  }>;
}

async function immichFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${IMMICH_URL}${path}`, {
    headers: { "x-api-key": IMMICH_API_KEY! },
  });
  if (!res.ok) {
    throw new Error(`Immich API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function updateHASensor(state: string, attributes: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${HA_URL}/api/states/sensor.immich_health`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state,
      attributes: {
        friendly_name: "Immich Health",
        icon: state === "healthy" ? "mdi:check-circle" : "mdi:alert-circle",
        ...attributes,
      },
    }),
  });

  if (!res.ok) {
    console.error(`HA state update failed (${res.status}): ${await res.text()}`);
  }
}

async function notifyHA(title: string, message: string): Promise<void> {
  const res = await fetch(`${HA_URL}/api/services/notify/mobile_app_${HA_NOTIFY_DEVICE}`, {
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

async function poll(): Promise<void> {
  try {
    const [stats, jobs] = await Promise.all([
      immichFetch<ImmichStats>("/api/server/statistics"),
      immichFetch<Record<string, ImmichJobStatus>>("/api/jobs"),
    ]);

    let state: "healthy" | "degraded" | "error" = "healthy";
    const issues: string[] = [];
    let totalFailed = 0;

    for (const [jobName, jobStatus] of Object.entries(jobs)) {
      const failed = jobStatus.jobCounts.failed;
      totalFailed += failed;
      if (failed > 0) {
        issues.push(`${jobName}: ${failed} failed`);
      }
      if (jobStatus.queueStatus.isPaused) {
        issues.push(`${jobName}: paused`);
      }
    }

    if (totalFailed > 10) {
      state = "error";
    } else if (totalFailed > 0 || issues.length > 0) {
      state = "degraded";
    }

    const attributes = {
      photos: stats.photos,
      videos: stats.videos,
      usage_bytes: stats.usage,
      total_failed_jobs: totalFailed,
      issues: issues.join("; ") || "none",
      last_check: new Date().toISOString(),
    };

    await updateHASensor(state, attributes);
    console.log(`[${new Date().toISOString()}] Immich health: ${state} (${stats.photos} photos, ${totalFailed} failed jobs)`);

    if (state !== "healthy") {
      await notifyHA("Immich Health Alert", `Status: ${state}. ${issues.join(", ")}`);
    }
  } catch (err) {
    console.error(`Poll error: ${err}`);
    await updateHASensor("error", {
      issues: `Poll failed: ${err}`,
      last_check: new Date().toISOString(),
    });
    await notifyHA("Immich Unreachable", `Failed to poll Immich: ${err}`);
  }
}

// Run immediately, then on interval
console.log(`immich-poller starting (interval: ${POLL_INTERVAL / 1000}s)`);
poll();
setInterval(poll, POLL_INTERVAL);
