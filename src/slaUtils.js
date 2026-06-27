/**
 * SLA thresholds in seconds
 */
export const SLA_THRESHOLDS = {
  WARNING: 120,    // 2 minutes
  CRITICAL: 300,   // 5 minutes
  TIMEOUT: 600     // 10 minutes
};

/**
 * Calculates SLA details for a pending order
 * @param {string} createdAt - ISO date string of order placement
 * @returns {object} SLA details including status, elapsed seconds, timer text, and color styles
 */
export function getOrderSlaDetails(createdAt) {
  if (!createdAt) {
    return {
      status: 'NORMAL',
      elapsedSeconds: 0,
      timerText: '0s',
      color: 'var(--color-success)',
      flashing: false
    };
  }

  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedSeconds = Math.max(0, Math.floor((now - createdTime) / 1000));

  let status = 'NORMAL';
  let color = '#25D366'; // success green
  let flashing = false;

  if (elapsedSeconds >= SLA_THRESHOLDS.TIMEOUT) {
    status = 'EXPIRED';
    color = 'var(--color-danger)';
  } else if (elapsedSeconds >= SLA_THRESHOLDS.CRITICAL) {
    status = 'CRITICAL';
    color = '#ff3838'; // vibrant red
    flashing = true;
  } else if (elapsedSeconds >= SLA_THRESHOLDS.WARNING) {
    status = 'WARNING';
    color = '#ff9f43'; // warning orange
  }

  // Format timer text (e.g., "3m 42s" or "45s")
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timerText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return {
    status,
    elapsedSeconds,
    timerText,
    color,
    flashing
  };
}
