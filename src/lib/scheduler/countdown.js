import { tickCountdown, hardDeleteExpiredUsers } from "@/lib/db/repos/usersRepo.js";

let intervalId = null;
const TICK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function startCountdownScheduler() {
  if (intervalId) return;

  // Run immediately on start, then every 24 hours
  runTick();

  intervalId = setInterval(runTick, TICK_INTERVAL_MS);
  intervalId.unref?.(); // Don't prevent process exit
}

export function stopCountdownScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

async function runTick() {
  try {
    console.log("[scheduler] Running countdown tick...");
    const expiredIds = await tickCountdown();
    if (expiredIds.length > 0) {
      console.log(`[scheduler] ${expiredIds.length} user(s) expired, hard deleting...`);
      const deleted = await hardDeleteExpiredUsers();
      console.log(`[scheduler] Deleted ${deleted} expired user(s)`);
    } else {
      console.log("[scheduler] Countdown tick complete, no expirations");
    }
  } catch (error) {
    console.error("[scheduler] Countdown tick failed:", error);
  }
}

// Manual trigger for testing
export async function triggerTickNow() {
  await runTick();
}
