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
  
  const customerCharge = Math.max(22.0, 15.0 + distance * 7.0);
  const riderPayout = Math.max(17.0, 10.0 + distance * 7.0);
  
  return {
    customerCharge: parseFloat(customerCharge.toFixed(1)),
    riderPayout: parseFloat(riderPayout.toFixed(1))
  };
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

  // If the parameter is the old options object, map it to rules array format for unified processing
  let rules = [];
  if (Array.isArray(activeDeliveryPromos)) {
    rules = activeDeliveryPromos;
  } else if (activeDeliveryPromos && typeof activeDeliveryPromos === 'object') {
    if (activeDeliveryPromos.promoFoodFreeEnabled) {
      rules.push({ deliveryPromoType: 'free_delivery_food', minCart: 999 });
    }
    if (activeDeliveryPromos.promoGroceryFreeEnabled) {
      rules.push({ deliveryPromoType: 'free_delivery_grocery', minCart: 1999 });
    }
    if (activeDeliveryPromos.promoDelivery30Enabled) {
      rules.push({ deliveryPromoType: 'discount_delivery_percent', minCart: 599, discount: 30 });
    }
  }

  let finalFee = baseDeliveryFee;

  // Process all rules and find the one that gives the lowest delivery fee
  for (const rule of rules) {
    const minCartVal = rule.minCart ?? 0;
    if (subtotal <= minCartVal) continue;

    if (rule.deliveryPromoType === 'free_delivery_food') {
      const hasFoodItems = cartItems.some(item => 
        ['Fast Food', 'Restaurant Cafe', 'Bakery', 'Icecream and dessert', 'Juice and drink', 'Snacks and breakfast'].includes(item.category)
      );
      if (hasFoodItems) {
        finalFee = 0;
      }
    } else if (rule.deliveryPromoType === 'free_delivery_grocery') {
      const hasGroceryItems = cartItems.some(item => 
        ['General Store', 'Vegetable', 'Dairy', 'PixiGo Store'].includes(item.category)
      );
      if (hasGroceryItems) {
        finalFee = 0;
      }
    } else {
      // General or custom percentage delivery discount
      const pct = rule.discount ?? 0;
      const computed = Math.max(0, Math.round(baseDeliveryFee * (1 - pct / 100)));
      if (computed < finalFee) {
        finalFee = computed;
      }
    }
  }

  return finalFee;
};

/**
 * Parses the weight of a product from its name or specs string.
 * Supports kg, g, L, ml, grams, capsules, etc.
 * 
 * @param {string} text Input text
 * @returns {number|null} Weight in kilograms, or null if no weight found
 */
export const getProductWeight = (text) => {
  if (!text) return null;
  
  // Regex to look for patterns like 5kg, 200g, 1L, 500ml, Pack of 4
  const regex = /(\d+(?:\.\d+)?)\s*(kg|g|l|ml|litre|liters|grams|caps|capsules|pcs|pack)\b/i;
  const match = text.match(regex);
  
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit === 'kg' || unit === 'l' || unit === 'litre' || unit === 'liters') {
      return val;
    }
    if (unit === 'g' || unit === 'ml' || unit === 'grams') {
      return val / 1000;
    }
    if (unit === 'pack' || unit === 'pcs') {
      return val * 0.15; // Assume 150g per pc/pack
    }
    if (unit === 'caps' || unit === 'capsules') {
      return val * 0.005; // 5g per capsule
    }
  }
  
  // Fallbacks for known items without explicit weight in name:
  const lowerText = text.toLowerCase();
  if (lowerText.includes('cake')) return 1.0;
  if (lowerText.includes('pizza')) return 0.5;
  if (lowerText.includes('burger')) return 0.25;
  if (lowerText.includes('waffle')) return 0.3;
  if (lowerText.includes('paneer')) return 0.2;
  if (lowerText.includes('butter')) return 0.1;
  if (lowerText.includes('noodles')) return 0.28; // Pack of 4 -> 280g
  
  return null; // Return null if no matches found
};

/**
 * Calculates the total weight of all items in the cart in kg.
 * 
 * @param {Array} cart Cart items
 * @returns {number} Total weight in kilograms
 */
export const getCartTotalWeight = (cart) => {
  if (!cart || !Array.isArray(cart)) return 0;
  return cart.reduce((total, item) => {
    let weight = getProductWeight(item.specs); // Check variant specs first (e.g. "2L", "500ml")
    if (weight === null) {
      weight = getProductWeight(item.name); // Fallback to product name
    }
    if (weight === null) {
      weight = 0.5; // Final default fallback (0.5 kg)
    }
    return total + (weight * item.quantity);
  }, 0);
};


