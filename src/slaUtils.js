/**
 * Calculates SLA details for an order
 * @param {string} createdAt - ISO date string of order placement
 * @param {string} status - Current order status
 * @param {string} deliveryPartnerId - Assigned rider ID (if any)
 * @returns {object} SLA details including status, elapsed seconds, timer text, and color styles
 */
export function getOrderSlaDetails(createdAt, status = 'PLACED', deliveryPartnerId = null) {
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

  let statusLevel = 'NORMAL';
  let color = '#25D366'; // success green
  let flashing = false;

  const isRiderPool = (status === 'ACCEPTED' || status === 'READY_FOR_PICKUP') && !deliveryPartnerId;

  if (isRiderPool) {
    // Rider SLA thresholds: 5 min warning (300s), 10 min critical (600s), 15 min timeout (900s)
    if (elapsedSeconds >= 900) {
      statusLevel = 'EXPIRED';
      color = 'var(--color-danger)';
    } else if (elapsedSeconds >= 600) {
      statusLevel = 'CRITICAL';
      color = '#ff3838'; // flashing red
      flashing = true;
    } else if (elapsedSeconds >= 300) {
      statusLevel = 'WARNING';
      color = '#ff9f43'; // warning orange
    }
  } else {
    // Merchant SLA thresholds: 2 min warning (120s), 5 min critical (300s), 10 min timeout (600s)
    if (elapsedSeconds >= 600) {
      statusLevel = 'EXPIRED';
      color = 'var(--color-danger)';
    } else if (elapsedSeconds >= 300) {
      statusLevel = 'CRITICAL';
      color = '#ff3838'; // flashing red
      flashing = true;
    } else if (elapsedSeconds >= 120) {
      statusLevel = 'WARNING';
      color = '#ff9f43'; // warning orange
    }
  }

  // Format timer text (e.g., "3m 42s" or "45s")
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timerText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return {
    status: statusLevel,
    elapsedSeconds,
    timerText,
    color,
    flashing
  };
}
