/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * 
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  
  return parseFloat(d.toFixed(2));
};

/**
 * Calculates delivery charge (customer) and rider payout based on distance
 * using the Chittorgarh Route Pricing Matrix.
 * 
 * @param {number} distance Distance in kilometers
 * @returns {{ customerCharge: number, riderPayout: number }}
 */
export const calculateDeliveryRates = (distance) => {
  if (distance <= 0) {
    return { customerCharge: 0, riderPayout: 0 };
  }
  
  // Rule 1: Up to 1 km
  if (distance <= 1.0) {
    return { customerCharge: 28, riderPayout: 20 }; // Fixed fare (using middle of sheet ranges ₹26-29 / ₹19-20)
  }
  
  // Rule 2: Up to 2 km (1.0 km to 2.0 km)
  if (distance <= 2.0) {
    return { customerCharge: 33, riderPayout: 27 }; // Standard Fixed Fare
  }
  
  // Rule 3: Long Distance Rule (More than 2 km)
  // Base rate Setup: ₹30 (Customer) / ₹25 (Rider)
  // Scaling: Multiplier = Math.max(1.0, distance - 2.0). Every 0.5 km is scaled by ₹11 (Customer) / ₹8 (Rider) per 1.0 km equivalent.
  const multiplier = Math.max(1.0, distance - 2.0);
  
  const customerCharge = Math.round(30 + multiplier * 11);
  const riderPayout = Math.round(25 + multiplier * 8);
  
  return { customerCharge, riderPayout };
};

/**
 * Fetches the actual road-travel distance in kilometers using the free OSRM Routing API.
 * Falls back to straight-line Haversine distance on failure.
 * 
 * @param {number} shopLat Shop Latitude
 * @param {number} shopLng Shop Longitude
 * @param {number} customerLat Customer Latitude
 * @param {number} customerLng Customer Longitude
 * @returns {Promise<number>} Road distance in kilometers
 */
export const fetchRoadDistance = async (shopLat, shopLng, customerLat, customerLng) => {
  if (!shopLat || !shopLng || !customerLat || !customerLng) return 0;
  
  // Format coordinate URL structure: {lng},{lat};{lng},{lat}
  const url = `https://router.project-osrm.org/route/v1/driving/${shopLng},${shopLat};${customerLng},${customerLat}?overview=false`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const distanceInMeters = data.routes[0].distance;
      const distanceInKm = distanceInMeters / 1000;
      return parseFloat(distanceInKm.toFixed(2));
    }
    
    console.warn("OSRM API returned non-Ok status, falling back to Haversine straight-line distance.");
  } catch (error) {
    console.error("OSRM Routing API failed, falling back to Haversine straight-line distance:", error);
  }
  
  // Fallback to Haversine straight-line formula
  return getDistance(shopLat, shopLng, customerLat, customerLng);
};

/**
 * Calculates a discounted or free delivery fee based on promotional rules.
 * 
 * @param {number} subtotal Cart item value subtotal
 * @param {Array} cartItems Array of cart item objects
 * @param {number} baseDeliveryFee Computed base delivery charge
 * @param {Array|object} activeDeliveryPromos List of active delivery promo coupons or options object
 * @returns {number} Final delivery fee for the customer
 */
export const getPromotionalDeliveryFee = (subtotal, cartItems, baseDeliveryFee, activeDeliveryPromos = []) => {
  if (baseDeliveryFee <= 0) return 0;

  let foodRule = null;
  let groceryRule = null;
  let discountRule = null;

  if (Array.isArray(activeDeliveryPromos)) {
    foodRule = activeDeliveryPromos.find(p => p.deliveryPromoType === 'free_delivery_food');
    groceryRule = activeDeliveryPromos.find(p => p.deliveryPromoType === 'free_delivery_grocery');
    discountRule = activeDeliveryPromos.find(p => p.deliveryPromoType === 'discount_delivery_percent');
  } else if (activeDeliveryPromos && typeof activeDeliveryPromos === 'object') {
    // Fallback support for old options object parameter format
    if (activeDeliveryPromos.promoFoodFreeEnabled) {
      foodRule = { minCart: 999 };
    }
    if (activeDeliveryPromos.promoGroceryFreeEnabled) {
      groceryRule = { minCart: 1999 };
    }
    if (activeDeliveryPromos.promoDelivery30Enabled) {
      discountRule = { minCart: 599, discount: 30 };
    }
  }

  // 1. FREE Food Delivery: Order Value Above threshold & contains Food items
  if (foodRule) {
    const hasFoodItems = cartItems.some(item => 
      ['Fast Food', 'Restaurant Cafe', 'Bakery', 'Icecream and dessert', 'Juice and drink', 'Snacks and breakfast'].includes(item.category)
    );
    const minCartVal = foodRule.minCart ?? 999;
    if (subtotal > minCartVal && hasFoodItems) {
      return 0;
    }
  }

  // 2. FREE Grocery Delivery: Order Value Above threshold & contains Grocery items
  if (groceryRule) {
    const hasGroceryItems = cartItems.some(item => 
      ['General Store', 'Vegetable', 'Dairy', 'PixiGo Store'].includes(item.category)
    );
    const minCartVal = groceryRule.minCart ?? 1999;
    if (subtotal > minCartVal && hasGroceryItems) {
      return 0;
    }
  }

  // 3. Percentage Discount on Delivery Fee: Order Value Above threshold
  if (discountRule) {
    const minCartVal = discountRule.minCart ?? 599;
    if (subtotal > minCartVal) {
      const pct = discountRule.discount ?? 30;
      return Math.round(baseDeliveryFee * (1 - pct / 100));
    }
  }

  return baseDeliveryFee;
};

