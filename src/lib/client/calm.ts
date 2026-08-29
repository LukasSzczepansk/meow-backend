export async function logCalmActivity(activityType: string, durationSeconds?: number) {
  try {
    await fetch("/api/calm/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType, durationSeconds }),
    });
  } catch {
    // Calm experiences intentionally remain usable without a network response.
  }
}
