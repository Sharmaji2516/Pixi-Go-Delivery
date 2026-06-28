/**
 * Calculates SLA details for an order
 * @param {string} createdAt - ISO date string of order placement
 * @param {string} status - Current order status
 * @param {string} deliveryPartnerId - Assigned rider ID (if any)
 * @returns {object} SLA details including status, elapsed seconds, timer text, and color styles
 */
export function getOrderSlaDetails(createdAt, status = 'PLACED', deliveryPartnerId = null, acceptedAt = null) {
  if (!createdAt) {
    return {
      status: 'NORMAL',
      elapsedSeconds: 0,
      timerText: '0s',
      color: 'var(--color-success)',
      flashing: false
    };
  }

  const isRiderPool = (status === 'ACCEPTED' || status === 'READY_FOR_PICKUP') && !deliveryPartnerId;
  const baseTime = (isRiderPool && acceptedAt) ? acceptedAt : createdAt;
  const createdTime = new Date(baseTime).getTime();
  const now = Date.now();
  const elapsedSeconds = Math.max(0, Math.floor((now - createdTime) / 1000));

  let statusLevel = 'NORMAL';
  let color = '#25D366'; // success green
  let flashing = false;

  if (isRiderPool) {
    // Rider SLA thresholds: 1.5 min warning (90s), 3 min critical (180s), 5 min timeout (300s)
    if (elapsedSeconds >= 300) {
      statusLevel = 'EXPIRED';
      color = 'var(--color-danger)';
    } else if (elapsedSeconds >= 180) {
      statusLevel = 'CRITICAL';
      color = '#ff3838'; // flashing red
      flashing = true;
    } else if (elapsedSeconds >= 90) {
      statusLevel = 'WARNING';
      color = '#ff9f43'; // warning orange
    }
  } else {
    // Merchant SLA thresholds: 1.5 min warning (90s), 3 min critical (180s), 5 min timeout (300s)
    if (elapsedSeconds >= 300) {
      statusLevel = 'EXPIRED';
      color = 'var(--color-danger)';
    } else if (elapsedSeconds >= 180) {
      statusLevel = 'CRITICAL';
      color = '#ff3838'; // flashing red
      flashing = true;
    } else if (elapsedSeconds >= 90) {
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
