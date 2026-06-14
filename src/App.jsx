import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, User, Shield, Compass, Bike, Store, Trash2, 
  FileText, Check, X, ArrowRight, Download, Search, Tag, 
  MessageCircle, AlertCircle, Plus, MapPin, DollarSign, Activity, Eye, Phone, RefreshCw, Menu,
  Mail, Settings, ChevronDown
} from 'lucide-react';
import './App.css';
import { auth, db, rtdb, googleProvider, firebaseConfig } from './firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, onSnapshot, orderBy, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, remove as rtdbRemove } from 'firebase/database';

// Initial Mock Data with Premium Image URLs & Emoji Fallbacks
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Fresh Kirana Atta (5kg)', price: 280, category: 'General Store', store: 'Pooja Kirana Store', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=60', emoji: '🌾' },
  { id: 'p2', name: 'Organic Mustard Oil (1L)', price: 175, category: 'General Store', store: 'Pooja Kirana Store', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60', emoji: '🛢️' },
  { id: 'p3', name: 'Fresh Farm Tomatoes (1kg)', price: 40, category: 'Vegetable', store: 'Green Farms Veggies', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=300&auto=format&fit=crop&q=60', emoji: '🍅' },
  { id: 'p4', name: 'Alphonso Mangoes (1kg)', price: 250, category: 'Vegetable', store: 'Green Farms Veggies', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&auto=format&fit=crop&q=60', emoji: '🥭' },
  { id: 'p5', name: 'Creamy Paneer (200g)', price: 90, category: 'Dairy', store: 'Krishna Dairy', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop&q=60', emoji: '🥛' },
  { id: 'p6', name: 'Amul Salted Butter (100g)', price: 56, category: 'Dairy', store: 'Krishna Dairy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=60', emoji: '🧈' },
  { id: 'p7', name: 'Chocolate Fudge Cake', price: 650, category: 'Bakery', store: 'Bake House', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=60', emoji: '🎂' },
  { id: 'p8', name: 'Garlic Bread Sticks', price: 120, category: 'Bakery', store: 'Bake House', image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=300&auto=format&fit=crop&q=60', emoji: '🥖' },
  { id: 'p9', name: 'Crispy Veg Burger', price: 140, category: 'Fast Food', store: 'Burger Club', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60', emoji: '🍔' },
  { id: 'p10', name: 'Cheese Pizza (Medium)', price: 320, category: 'Fast Food', store: 'Pizza Corner', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60', emoji: '🍕' },
  { id: 'p11', name: 'Butter Chicken with Butter Naan', price: 380, category: 'Restaurant Cafe', store: 'Grand Plaza Restaurant', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&auto=format&fit=crop&q=60', emoji: '🍛' },
  { id: 'p12', name: 'Belgian Chocolate Waffle', price: 190, category: 'Restaurant Cafe', store: 'Sweet Treat Cafe', image: 'https://images.unsplash.com/photo-1562376502-6f769499887d?w=300&auto=format&fit=crop&q=60', emoji: '🧇' },
  { id: 'p13', name: 'Double Chocolate Ice Cream', price: 150, category: 'Icecream and dessert', store: 'Gelato Heaven', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&auto=format&fit=crop&q=60', emoji: '🍨' },
  { id: 'p14', name: 'Premium Multi-vitamins (60 Caps)', price: 890, category: 'Medical and fitness', store: 'Apollo Wellness', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60', emoji: '💊' },
  { id: 'p15', name: 'Fresh Orange Juice (500ml)', price: 110, category: 'Juice and drink', store: 'Juice Junction', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop&q=60', emoji: '🍹' },
  { id: 'p16', name: 'Masala Chai Mix (250g)', price: 180, category: 'Snacks and breakfast', store: 'Tea Valley', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=60', emoji: '☕' }
];

const INITIAL_SHOPS = [
  { id: 'merch_bake_house', storeName: 'Bake House', name: 'Bake House', category: 'Bakery', phone: '9251054064', address: 'C-Scheme, Jaipur', verified: true, docs: 'Approved' },
  { id: 'merch_pooja_kirana', storeName: 'Pooja Kirana Store', name: 'Pooja Kirana Store', category: 'General Store', phone: '9251054064', address: 'Mansarovar, Jaipur', verified: true, docs: 'Approved' },
  { id: 'merch_krishna_dairy', storeName: 'Krishna Dairy', name: 'Krishna Dairy', category: 'Dairy', phone: '9251054064', address: 'Vaishali Nagar, Jaipur', verified: true, docs: 'Approved' },
  { id: 'merch_grand_plaza', storeName: 'Grand Plaza Restaurant', name: 'Grand Plaza Restaurant', category: 'Restaurant Cafe', phone: '9251054064', address: 'C-Scheme, Jaipur', verified: true, docs: 'Approved' },
  { id: 'merch_green_farms', storeName: 'Green Farms Veggies', name: 'Green Farms Veggies', category: 'Vegetable', phone: '9251054064', address: 'Mansarovar, Jaipur', verified: true, docs: 'Approved' }
];

const INITIAL_DELIVERY_PARTNERS = [];

const INITIAL_ORDERS = [];

const parseCoords = (locationStr) => {
  if (!locationStr) return null;
  const match = locationStr.match(/Lat:\s*([0-9.-]+),\s*Lng:\s*([0-9.-]+)/i);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  const lower = locationStr.toLowerCase();
  if (lower.includes('mansarovar')) {
    return { lat: 26.8530, lng: 75.7621 };
  }
  if (lower.includes('c-scheme')) {
    return { lat: 26.9100, lng: 75.8000 };
  }
  if (lower.includes('vaishali')) {
    return { lat: 26.9000, lng: 75.7500 };
  }
  return { lat: 26.9124, lng: 75.7873 };
};

const extractFriendlyAddress = (locationStr) => {
  if (!locationStr) return 'Customer Location';
  const parts = locationStr.split(' (Lat:');
  if (parts.length > 0) {
    return parts[0].trim();
  }
  return locationStr;
};

function useRiderLocation(trackingOrderId) {
  const [riderCoords, setRiderCoords] = useState(null);
  useEffect(() => {
    if (!trackingOrderId) {
      setRiderCoords(null);
      return;
    }
    const locationPathRef = rtdbRef(rtdb, `deliveries/${trackingOrderId}`);
    const unsubscribe = rtdbOnValue(locationPathRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.lat && data.lng) {
        setRiderCoords({ lat: data.lat, lng: data.lng });
      } else {
        setRiderCoords(null);
      }
    }, (error) => {
      console.error("RTDB error reading rider coords:", error);
    });
    return () => unsubscribe();
  }, [trackingOrderId]);
  return riderCoords;
}

const LeafletMap = ({ 
  riderCoords, 
  merchantCoords, 
  customerCoords, 
  customerName = 'Customer', 
  merchantName = 'Store', 
  isInteractive = false, 
  onLocationChange = null 
}) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ rider: null, merchant: null, customer: null });

  useEffect(() => {
    if (!containerRef.current) return;
    if (!window.L) {
      console.error("Leaflet is not loaded globally.");
      return;
    }

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([26.9124, 75.7873], 13);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    const createEmojiIcon = (emoji, glowColor = 'rgba(0,255,242,0.6)') => {
      return window.L.divIcon({
        html: `<div style="font-size: 26px; display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 0 6px ${glowColor}); cursor: pointer;">${emoji}</div>`,
        className: 'custom-leaflet-emoji-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -10]
      });
    };

    if (merchantCoords && merchantCoords.lat && merchantCoords.lng) {
      if (!markersRef.current.merchant) {
        markersRef.current.merchant = window.L.marker([merchantCoords.lat, merchantCoords.lng], {
          icon: createEmojiIcon('🏪', 'rgba(245, 158, 11, 0.6)')
        }).addTo(map);
      } else {
        markersRef.current.merchant.setLatLng([merchantCoords.lat, merchantCoords.lng]);
      }
      markersRef.current.merchant.bindPopup(`<h4>🏪 ${merchantName}</h4><p>Pickup Store Location</p>`);
    } else {
      if (markersRef.current.merchant) {
        markersRef.current.merchant.remove();
        markersRef.current.merchant = null;
      }
    }

    if (customerCoords && customerCoords.lat && customerCoords.lng) {
      if (!markersRef.current.customer) {
        markersRef.current.customer = window.L.marker([customerCoords.lat, customerCoords.lng], {
          icon: createEmojiIcon('🏠', 'rgba(0, 255, 242, 0.6)'),
          draggable: isInteractive
        }).addTo(map);
      } else {
        markersRef.current.customer.setLatLng([customerCoords.lat, customerCoords.lng]);
        if (isInteractive) {
          markersRef.current.customer.dragging.enable();
        } else {
          markersRef.current.customer.dragging.disable();
        }
      }
      markersRef.current.customer.bindPopup(`<h4>🏠 ${customerName}</h4><p>Delivery Destination</p>`);
      
      if (isInteractive) {
        markersRef.current.customer.off('dragend');
        markersRef.current.customer.on('dragend', (e) => {
          const position = e.target.getLatLng();
          if (onLocationChange) {
            onLocationChange(position.lat, position.lng);
          }
        });
      }
    } else {
      if (markersRef.current.customer) {
        markersRef.current.customer.remove();
        markersRef.current.customer = null;
      }
    }

    if (riderCoords && riderCoords.lat && riderCoords.lng) {
      if (!markersRef.current.rider) {
        markersRef.current.rider = window.L.marker([riderCoords.lat, riderCoords.lng], {
          icon: createEmojiIcon('🛵', 'rgba(173, 255, 47, 0.8)')
        }).addTo(map);
      } else {
        markersRef.current.rider.setLatLng([riderCoords.lat, riderCoords.lng]);
      }
      markersRef.current.rider.bindPopup(`<h4>🛵 Active Rider</h4><p>On the Way (Real-Time GPS)</p>`);
    } else {
      if (markersRef.current.rider) {
        markersRef.current.rider.remove();
        markersRef.current.rider = null;
      }
    }

    // Interactive map clicks
    if (isInteractive) {
      map.off('click');
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
      });
    } else {
      map.off('click');
    }

    const group = [];
    if (merchantCoords && merchantCoords.lat && merchantCoords.lng) group.push([merchantCoords.lat, merchantCoords.lng]);
    if (customerCoords && customerCoords.lat && customerCoords.lng) group.push([customerCoords.lat, customerCoords.lng]);
    if (riderCoords && riderCoords.lat && riderCoords.lng) group.push([riderCoords.lat, riderCoords.lng]);

    if (group.length > 0) {
      map.fitBounds(group, { padding: [35, 35], maxZoom: 16 });
    }
  }, [riderCoords, merchantCoords, customerCoords, customerName, merchantName, isInteractive]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = { rider: null, merchant: null, customer: null };
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '180px' }} />;
};

function App() {
  // --- STATE DECLARATIONS ---
  const [activeTab, setActiveTab] = useState('customer'); // customer | admin | delivery | merchant
  const [riderWatchId, setRiderWatchId] = useState(null);
  const [riderTrackingOrderId, setRiderTrackingOrderId] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [riderPhoneInput, setRiderPhoneInput] = useState('');
  const [riderVehicleInput, setRiderVehicleInput] = useState('');
  const [riderEmailInput, setRiderEmailInput] = useState('');
  const [userRole, setUserRole] = useState(null); // admin | rider | customer | null
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderEmail, setNewRiderEmail] = useState('');
  const [newRiderPassword, setNewRiderPassword] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderVehicle, setNewRiderVehicle] = useState('');
  const [editingRider, setEditingRider] = useState(null);
  const [editRiderName, setEditRiderName] = useState('');
  const [editRiderEmail, setEditRiderEmail] = useState('');
  const [editRiderPhone, setEditRiderPhone] = useState('');
  const [editRiderVehicle, setEditRiderVehicle] = useState('');
  const [editRiderPassword, setEditRiderPassword] = useState('');
  const [isEditRiderModalOpen, setIsEditRiderModalOpen] = useState(false);
  const [selectedShopDetails, setSelectedShopDetails] = useState(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [deliveryPartners, setDeliveryPartners] = useState(INITIAL_DELIVERY_PARTNERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [baseDeliveryCharge, setBaseDeliveryCharge] = useState(20);
  const [perKmCharge, setPerKmCharge] = useState(5);
  const [bankAccount, setBankAccount] = useState('SBI - A/C 98127391238 (IFSC: SBIN0007204)');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('item'); // item | shop
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('pixigo_customerName') || 'Raj Malhotra');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('pixigo_customerPhone') || '9251054064');
  const [customerEmail, setCustomerEmail] = useState(() => localStorage.getItem('pixigo_customerEmail') || 'pixigodelivery@gmail.com');
  const [customerAddress, setCustomerAddress] = useState(() => localStorage.getItem('pixigo_customerAddress') || 'Vaishali Nagar, Jaipur (RJ)');
  const [selectedPayment, setSelectedPayment] = useState('ONLINE');
  const [currentOrderTracking, setCurrentOrderTracking] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTrackingDrawerOpen, setIsTrackingDrawerOpen] = useState(false);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [adminSubView, setAdminSubView] = useState('orders'); // orders | shops | riders
  const [showPastOrders, setShowPastOrders] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopCategory, setNewShopCategory] = useState('General Store');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [isMerchantApprovalsOpen, setIsMerchantApprovalsOpen] = useState(false);
  const [isRiderApprovalsOpen, setIsRiderApprovalsOpen] = useState(false);
  const [newShopEmail, setNewShopEmail] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Bakery');
  const [merchantShopSelect, setMerchantShopSelect] = useState('Bake House');
  const audioContextRef = useRef(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductCategory, setEditProductCategory] = useState('General Store');
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isProductApprovalsOpen, setIsProductApprovalsOpen] = useState(true);

  // Deal of the Day States
  const [dealOfTheDay, setDealOfTheDay] = useState({
    image: 'https://images.unsplash.com/photo-1562376502-6f769499887d?w=800&auto=format&fit=crop&q=80',
    text: 'Belgian Chocolate Waffle - Sweet Treat Cafe - Flat 20% Off!',
    active: true,
    verticalOffset: '50',
    horizontalOffset: '50',
    zoom: '1'
  });
  const [dealTextEdit, setDealTextEdit] = useState('');
  const [dealImageEdit, setDealImageEdit] = useState('');
  const [dealActiveEdit, setDealActiveEdit] = useState(false);
  const [dealVerticalOffsetEdit, setDealVerticalOffsetEdit] = useState('50');
  const [dealHorizontalOffsetEdit, setDealHorizontalOffsetEdit] = useState('50');
  const [dealZoomEdit, setDealZoomEdit] = useState('1');
  const [activeSettingsAccordion, setActiveSettingsAccordion] = useState('global'); // 'global' | 'deal' | 'preview' | 'guide'
  const [activePreviewTab, setActivePreviewTab] = useState('desktop'); // 'desktop' | 'mobile'

  const [shopDocAadhaar, setShopDocAadhaar] = useState(false);
  const [shopDocPan, setShopDocPan] = useState(false);
  const [shopDocFssai, setShopDocFssai] = useState(false);

  // --- HELPER FUNCTIONS ---
  const showToast = (message) => {
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    setToast({ show: true, message });
    const id = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2500);
    setToastTimeoutId(id);
  };

  const getFriendlyAuthError = (message) => {
    if (!message) return '';
    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
      return 'Invalid email address or password. Please try again.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'This email is already in use. Try logging in instead.';
    }
    if (message.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (message.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('auth/popup-closed-by-user')) {
      return 'Popup closed. Please try again.';
    }
    return message.replace('Firebase: ', '').replace(/Error\s*\(auth\/.*\)\.?/, '').trim();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    localStorage.setItem('pixigo_customerName', customerName);
    localStorage.setItem('pixigo_customerPhone', customerPhone);
    localStorage.setItem('pixigo_customerEmail', customerEmail);
    localStorage.setItem('pixigo_customerAddress', customerAddress);

    // Save profile to Firestore /customers Collection (fallback to guest ID for unauthenticated testers)
    const customerId = auth.currentUser ? auth.currentUser.uid : `guest_${customerPhone || 'anonymous'}`;
    try {
      const customerDocRef = doc(db, "customers", customerId);
      await setDoc(customerDocRef, {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Error saving customer profile to Firestore:", err);
    }

    showToast('Profile settings saved successfully!');
    setIsProfileOpen(false);
  };
  const handleAutoDetectLocation = (setAddressCallback) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);

    const processPosition = async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        const data = await response.json();
        let readableAddress = "";
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          readableAddress = parts.slice(0, 4).join(',').trim();
        } else {
          readableAddress = "Detected Location";
        }
        const formattedAddress = `${readableAddress} (Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)})`;
        setAddressCallback(formattedAddress);
        showToast("Location auto-detected successfully!");
      } catch (error) {
        console.error("Nominatim Reverse Geocoding failed:", error);
        const formattedAddress = `Detected Location (Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)})`;
        setAddressCallback(formattedAddress);
        showToast("Coordinates loaded (friendly address fetch failed).");
      } finally {
        setIsLocating(false);
      }
    };

    const fallbackGetPosition = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await processPosition(position);
        },
        (error) => {
          console.error("Fallback Geolocation failed:", error);
          alert(`Failed to detect location: ${error.message}`);
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    };

    // Try high accuracy first, timeout after 3.5 seconds
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await processPosition(position);
      },
      (error) => {
        console.warn("High accuracy geolocation failed/timed out, trying fallback...", error);
        fallbackGetPosition();
      },
      { enableHighAccuracy: true, timeout: 3500, maximumAge: 0 }
    );
  };

  const handleMapLocationChange = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      let readableAddress = "";
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        readableAddress = parts.slice(0, 4).join(',').trim();
      } else {
        readableAddress = "Selected Location";
      }
      const formattedAddress = `${readableAddress} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`;
      setCustomerAddress(formattedAddress);
      showToast("Location updated from map!");
    } catch (error) {
      console.error("Nominatim Reverse Geocoding failed:", error);
      const formattedAddress = `Selected Location (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`;
      setCustomerAddress(formattedAddress);
      showToast("Coordinates updated from map.");
    }
  };
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    window.history.pushState(null, '', `/${tabName}`);
  };

  // --- SIDE EFFECTS (useEffect) ---

  // Simple Frontend URL Router
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace('/', '').toLowerCase();
      if (['customer', 'admin', 'delivery', 'merchant'].includes(path)) {
        setActiveTab(path);
      } else if (path === 'rider') {
        setActiveTab('delivery');
      } else if (path === 'shop') {
        setActiveTab('merchant');
      } else {
        setActiveTab('customer');
      }
    };
    
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const savedRider = localStorage.getItem('pixigo_rider_session');
      const currentTab = window.location.pathname.replace('/', '').toLowerCase();
      if ((currentTab === 'delivery' || currentTab === 'rider') && savedRider) {
        try {
          const riderData = JSON.parse(savedRider);
          setUser(riderData);
          setUserRole('rider');
          return; // Skip Firebase Auth override
        } catch (e) {
          console.error("Error parsing rider session on auth state change:", e);
        }
      }

      if (currentUser) {
        const nameVal = currentUser.displayName || currentUser.email.split('@')[0];
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          name: nameVal
        });

        // Retrieve local storage values first
        let localName = localStorage.getItem('pixigo_customerName') || nameVal;
        let localPhone = localStorage.getItem('pixigo_customerPhone') || '';
        let localEmail = localStorage.getItem('pixigo_customerEmail') || currentUser.email;
        let localAddress = localStorage.getItem('pixigo_customerAddress') || '';

        try {
          const timestamp = new Date().toISOString();
          const currentTab = window.location.pathname.replace('/', '').toLowerCase();

          // 1. Sync with Customer collection
          const customerDocRef = doc(db, "customers", currentUser.uid);
          const custSnap = await getDoc(customerDocRef);
          if (custSnap.exists()) {
            const data = custSnap.data();
            localName = data.name || localName;
            localPhone = data.phone || localPhone;
            localEmail = data.email || localEmail;
            localAddress = data.address || localAddress;

            localStorage.setItem('pixigo_customerName', localName);
            localStorage.setItem('pixigo_customerPhone', localPhone);
            localStorage.setItem('pixigo_customerEmail', localEmail);
            localStorage.setItem('pixigo_customerAddress', localAddress);
          } else {
            // Document doesn't exist yet, auto-create
            await setDoc(customerDocRef, {
              name: localName,
              email: localEmail,
              phone: localPhone,
              address: localAddress,
              createdAt: timestamp
            });
          }

          // 2. Sync with Admin collection if on admin page
          if (currentTab === 'admin') {
            const adminDocRef = doc(db, "admins", currentUser.uid);
            const adminSnap = await getDoc(adminDocRef);
            if (!adminSnap.exists()) {
              await setDoc(adminDocRef, {
                id: currentUser.uid,
                name: localName,
                email: localEmail,
                role: 'admin',
                createdAt: timestamp
              });
            }
          }


          const adminDocRef = doc(db, "admins", currentUser.uid);
          const adminSnap = await getDoc(adminDocRef);
          if (adminSnap.exists()) {
            setUserRole('admin');
          } else {
            const riderDocRef = doc(db, "delivery_boys", currentUser.uid);
            const riderSnap = await getDoc(riderDocRef);
            if (riderSnap.exists()) {
              setUserRole('rider');
            } else {
              setUserRole('customer');
            }
          }
        } catch (e) {
          console.error("Error auto-syncing Firestore user profiles:", e);
          setUserRole('customer');
        }

        setCustomerEmail(localEmail);
        setCustomerName(localName);
        setCustomerPhone(localPhone);
        setCustomerAddress(localAddress);
      } else {
        const savedRider = localStorage.getItem('pixigo_rider_session');
        if (savedRider) {
          try {
            const riderData = JSON.parse(savedRider);
            setUser(riderData);
            setUserRole('rider');
          } catch (e) {
            console.error("Error parsing rider session:", e);
            setUser(null);
            setUserRole(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time orders from Firestore
  useEffect(() => {
    if (!user) {
      setOrders(INITIAL_ORDERS);
      return;
    }

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedOrders.push({
          firestoreId: doc.id,
          id: data.id || doc.id,
          ...data
        });
      });

      console.log("Firestore sync succeeded. Synced orders count:", fetchedOrders.length);
      console.log("Synced orders details:", fetchedOrders.map(o => ({ id: o.id, email: o.customerEmail || o.email, status: o.status, userId: o.userId })));
      setDbError(null);

      // Merge fetched orders with default INITIAL_ORDERS to keep mock orders visible
      const mergedOrders = [...fetchedOrders];
      INITIAL_ORDERS.forEach(mockOrder => {
        if (!mergedOrders.some(o => o.id === mockOrder.id)) {
          mergedOrders.push(mockOrder);
        }
      });
      setOrders(mergedOrders);
    }, (error) => {
      console.error("Firestore order subscription error/warning:", error.message);
      setDbError(error.message);
      setOrders(INITIAL_ORDERS);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Fetch real-time products from Firestore
  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetchedProducts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          firestoreId: doc.id,
          id: data.id || doc.id,
          ...data
        });
      });
      // Merge with INITIAL_PRODUCTS to keep mock ones visible
      const mergedProducts = [...fetchedProducts];
      INITIAL_PRODUCTS.forEach(mockProd => {
        if (!mergedProducts.some(p => p.id === mockProd.id)) {
          mergedProducts.push(mockProd);
        }
      });
      setProducts(mergedProducts);
    }, (error) => {
      console.error("Firestore products subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time merchants from Firestore
  useEffect(() => {
    const merchantsRef = collection(db, "merchants");
    const unsubscribe = onSnapshot(merchantsRef, (snapshot) => {
      const fetchedShops = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedShops.push({
          firestoreId: doc.id,
          id: data.id || doc.id,
          name: data.storeName || data.name || 'Store',
          ...data
        });
      });
      // Merge with INITIAL_SHOPS to keep mock ones visible
      const mergedShops = [...fetchedShops];
      INITIAL_SHOPS.forEach(mockShop => {
        if (!mergedShops.some(s => s.id === mockShop.id)) {
          mergedShops.push(mockShop);
        }
      });
      setShops(mergedShops);
    }, (error) => {
      console.error("Firestore merchants subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time delivery partners from Firestore
  useEffect(() => {
    const ridersRef = collection(db, "delivery_boys");
    const unsubscribe = onSnapshot(ridersRef, (snapshot) => {
      const fetchedRiders = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedRiders.push({
          firestoreId: doc.id,
          id: data.id || doc.id,
          name: data.riderName || data.name || 'Rider',
          ...data
        });
      });
      // Merge with INITIAL_DELIVERY_PARTNERS to keep mock ones visible
      const mergedRiders = [...fetchedRiders];
      INITIAL_DELIVERY_PARTNERS.forEach(mockRider => {
        if (!mergedRiders.some(r => r.id === mockRider.id)) {
          mergedRiders.push(mockRider);
        }
      });
      setDeliveryPartners(mergedRiders);
    }, (error) => {
      console.error("Firestore delivery partners subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time Deal of the Day configuration from Firestore
  useEffect(() => {
    const dealDocRef = doc(db, "configs", "deal_of_the_day");
    const unsubscribe = onSnapshot(dealDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDealOfTheDay({
          image: data.image || 'https://images.unsplash.com/photo-1562376502-6f769499887d?w=800&auto=format&fit=crop&q=80',
          text: data.text || 'Belgian Chocolate Waffle - Sweet Treat Cafe - Flat 20% Off!',
          active: data.active !== false,
          verticalOffset: data.verticalOffset || '50',
          horizontalOffset: data.horizontalOffset || '50',
          zoom: data.zoom || '1'
        });
        setDealTextEdit(data.text || '');
        setDealImageEdit(data.image || '');
        setDealActiveEdit(data.active !== false);
        setDealVerticalOffsetEdit(data.verticalOffset || '50');
        setDealHorizontalOffsetEdit(data.horizontalOffset || '50');
        setDealZoomEdit(data.zoom || '1');
      }
    }, (error) => {
      console.error("Firestore deal configurations subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      const playBeep = (freq, duration, delay) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          playBeep(880, 0.15, 0);      // First beep
          playBeep(1046.5, 0.25, 0.2); // Second beep
        });
      } else {
        playBeep(880, 0.15, 0);      // First beep
        playBeep(1046.5, 0.25, 0.2); // Second beep
      }
    } catch (e) {
      console.warn("Audio Context sound failed:", e);
    }
  };

  // Pre-enable audio context on user gesture
  useEffect(() => {
    const handleGesture = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (e) {
        console.warn("Silent audio context unlock failed:", e);
      }
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  const prevActiveJobsCount = useRef(0);
  const riderActiveJobs = user ? orders.filter(o => o.deliveryPartnerId === user.uid && o.status !== 'COMPLETED') : [];

  useEffect(() => {
    if (riderActiveJobs.length > prevActiveJobsCount.current) {
      if (prevActiveJobsCount.current > 0 || (activeTab === 'delivery' && riderActiveJobs.length > 0)) {
        playNotificationSound();
        showToast("🔔 New delivery run assigned! Check details below.");
      }
    }
    prevActiveJobsCount.current = riderActiveJobs.length;
  }, [riderActiveJobs.length, activeTab]);

  // Get active merchant shop based on email or phone
  const loggedInMerchantShop = user ? shops.find(s => 
    (s.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
    (s.phone && s.phone.trim() === user.email.trim())
  ) : null;

  const currentMerchantShopName = loggedInMerchantShop ? (loggedInMerchantShop.storeName || loggedInMerchantShop.name) : merchantShopSelect;

  // Sync merchantShopSelect with logged in merchant's shop name automatically
  useEffect(() => {
    if (activeTab === 'merchant' && loggedInMerchantShop) {
      const shopName = loggedInMerchantShop.storeName || loggedInMerchantShop.name;
      if (shopName) {
        setMerchantShopSelect(shopName);
      }
    }
  }, [activeTab, loggedInMerchantShop, shops]);

  const prevMerchantOrdersCount = useRef(0);

  // New Order Alerts for Merchant
  useEffect(() => {
    if (activeTab === 'merchant' && user && currentMerchantShopName) {
      // Find orders for this merchant shop that are pending acceptance
      const merchantPendingOrders = orders.filter(o => 
        (o.merchantName === currentMerchantShopName || (o.items && o.items.some(i => i.store === currentMerchantShopName))) &&
        ['PLACED', 'PENDING'].includes(o.status)
      );

      if (merchantPendingOrders.length > prevMerchantOrdersCount.current) {
        if (prevMerchantOrdersCount.current > 0 || merchantPendingOrders.length > 0) {
          playNotificationSound();
          const latestOrder = merchantPendingOrders[0];
          showToast(`🔔 New order received for your shop! Order ID: ${latestOrder.id}`);
          
          setTimeout(() => {
            alert(`🔔 New Order Received!\nOrder ID: ${latestOrder.id}\nCustomer: ${latestOrder.customerName}\nAmount: ${formatINR(latestOrder.totalAmount)}\nPlease accept the order to prepare it.`);
          }, 100);
        }
      }
      prevMerchantOrdersCount.current = merchantPendingOrders.length;
    }
  }, [orders, currentMerchantShopName, activeTab, user]);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword) {
      setAuthError(activeTab === 'delivery' ? 'Please enter both your name and password.' : 'Please enter both your email address and password.');
      return;
    }

    if (activeTab === 'delivery') {
      if (isSignUp) {
        if (!riderPhoneInput || !riderVehicleInput || !riderEmailInput) {
          setAuthError('Please fill in all Rider details (Email, Phone, and Vehicle) for registration.');
          return;
        }
        if (deliveryPartners.some(d => d.name.toLowerCase() === authEmail.trim().toLowerCase())) {
          setAuthError('This Rider Name / Username is already taken. Please try a different name.');
          return;
        }
        if (deliveryPartners.some(d => (d.phone || '').trim() === riderPhoneInput.trim())) {
          setAuthError('This Phone Number is already registered to a Rider.');
          return;
        }
        if (deliveryPartners.some(d => (d.email || '').trim().toLowerCase() === riderEmailInput.trim().toLowerCase())) {
          setAuthError('This Email Address is already registered to a Rider.');
          return;
        }
        
        const newRiderId = `rider_${Date.now()}`;
        const newRiderDoc = {
          id: newRiderId,
          name: authEmail.trim(),
          password: authPassword,
          email: riderEmailInput.trim().toLowerCase(),
          phone: riderPhoneInput.trim(),
          vehicle: riderVehicleInput.trim(),
          active: true,
          verified: false,
          totalDeliveries: 0,
          pendingPayout: 0,
          createdAt: new Date().toISOString()
        };

        try {
          const riderDocRef = doc(db, "delivery_boys", newRiderId);
          await setDoc(riderDocRef, newRiderDoc);
          
          const sessionData = {
            uid: newRiderId,
            name: authEmail.trim(),
            email: newRiderDoc.email,
            role: 'rider'
          };
          localStorage.setItem('pixigo_rider_session', JSON.stringify(sessionData));
          setUser(sessionData);
          setUserRole('rider');
          
          showToast("Rider account registered successfully! Pending Admin verification.");
          setAuthEmail('');
          setAuthPassword('');
          setRiderPhoneInput('');
          setRiderVehicleInput('');
          setRiderEmailInput('');
          setAuthError('');
        } catch (err) {
          console.error("Error creating rider document in Firestore:", err);
          setAuthError(`Registration failed: ${err.message}`);
        }
      } else {
        const matchedRider = deliveryPartners.find(d => 
          d.name.toLowerCase() === authEmail.trim().toLowerCase() ||
          (d.email && d.email.toLowerCase() === authEmail.trim().toLowerCase())
        );
        if (matchedRider) {
          if (matchedRider.password === authPassword) {
            const sessionData = {
              uid: matchedRider.id,
              name: matchedRider.name,
              email: matchedRider.email || `${matchedRider.name.replace(/\s+/g, '').toLowerCase()}_rider@pixigo.com`,
              role: 'rider'
            };
            localStorage.setItem('pixigo_rider_session', JSON.stringify(sessionData));
            setUser(sessionData);
            setUserRole('rider');
            
            showToast(`Welcome back, ${matchedRider.name}!`);
            setAuthEmail('');
            setAuthPassword('');
            setAuthError('');
          } else {
            setAuthError('Incorrect password. Please try again.');
          }
        } else {
          setAuthError('Rider Name / Username not found. Check spelling or register.');
        }
      }
      return;
    }

    let targetEmail = authEmail;
    
    if (isSignUp) {
      createUserWithEmailAndPassword(auth, targetEmail, authPassword)
        .then(async (userCredential) => {
          const uid = userCredential.user.uid;
          const email = targetEmail;
          const name = email.split('@')[0];
          const timestamp = new Date().toISOString();
          const currentTab = window.location.pathname.replace('/', '').toLowerCase();

          try {
            // 1. Initialize customer document in Firestore
            const customerDocRef = doc(db, "customers", uid);
            await setDoc(customerDocRef, {
              name: name,
              email: email,
              phone: '',
              address: '',
              createdAt: timestamp
            });

            // 2. Sync with Admin collection if on admin page
            if (currentTab === 'admin') {
              const adminDocRef = doc(db, "admins", uid);
              await setDoc(adminDocRef, {
                id: uid,
                name: name,
                email: email,
                role: 'admin',
                createdAt: timestamp
              });
            }


          } catch (e) {
            console.error("Error creating user documents in Firestore:", e);
          }
          showToast(`Account created successfully for ${userCredential.user.email}!`);
          setIsAuthModalOpen(false);
          setAuthEmail('');
          setAuthPassword('');
          setRiderPhoneInput('');
          setRiderVehicleInput('');
          setAuthError('');
        })
        .catch((error) => {
          setAuthError(getFriendlyAuthError(error.message));
        });
    } else {
      signInWithEmailAndPassword(auth, targetEmail, authPassword)
        .then((userCredential) => {
          showToast(`Welcome back, ${userCredential.user.email.split('@')[0]}!`);
          setIsAuthModalOpen(false);
          setAuthEmail('');
          setAuthPassword('');
          setAuthError('');
        })
        .catch((error) => {
          setAuthError(getFriendlyAuthError(error.message));
        });
    }
  };

  const handleForgotPassword = () => {
    if (!authEmail) {
      setAuthError('Please enter your email address first, then click Forgot Password.');
      return;
    }
    setAuthError('');
    sendPasswordResetEmail(auth, authEmail)
      .then(() => {
        const msg = 'Password reset link sent! Check your email inbox. Please check your bin also.';
        showToast(msg);
        setAuthError(msg);
      })
      .catch((error) => {
        setAuthError(getFriendlyAuthError(error.message));
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('pixigo_rider_session');
    setUser(null);
    setUserRole(null);
    signOut(auth)
      .then(() => {
        alert('Logged out successfully!');
      })
      .catch((error) => {
        console.warn("Auth sign out warning:", error);
      });
  };

  // Active Category list
  const categories = [
    'All', 'General Store', 'Vegetable', 'Dairy', 'Bakery', 'Fast Food', 
    'Restaurant Cafe', 'Icecream and dessert', 'Medical and fitness', 
    'Juice and drink', 'Snacks and breakfast'
  ];

  // System Stats for Admin View
  const stats = {
    totalOrders: orders.length,
    activeCustomers: new Set(orders.map(o => o.customerEmail)).size,
    activeMerchants: shops.filter(s => s.verified).length,
    activeRiders: deliveryPartners.filter(d => d.verified).length,
    totalSales: orders.reduce((acc, o) => acc + o.totalAmount, 0),
    totalDiscounts: orders.reduce((acc, o) => acc + o.discountAmount, 0),
    totalDeliveryFee: orders.reduce((acc, o) => acc + o.deliveryCharge, 0),
    netProfit: orders.reduce((acc, o) => {
      // Net Profit = Total Commission - Total Delivery Boy Payouts
      const riderPayout = o.status === 'COMPLETED' ? o.deliveryCharge : 0;
      return acc + (o.commissionAmount - riderPayout);
    }, 0)
  };

  // Helper: Format price in INR
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // Add Item to Cart
  const handleAddToCart = (product) => {
    const hasDifferentStore = cart.some(item => item.store !== product.store);
    if (hasDifferentStore) {
      alert("Dear user, you have to order from another because we deliver a category product");
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    showToast(`${product.name} added to cart!`);
  };

  // Update Cart Quantity
  const handleUpdateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item.quantity + delta <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i));
    }
  };

  // Remove Item from Cart
  const handleRemoveItem = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  // Apply Discount Coupon Code
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME100') {
      setAppliedDiscount(100);
      alert('Coupon Applied Successfully: Flat ₹100 Off!');
    } else if (couponCode.toUpperCase() === 'PIXIGO10') {
      const cartSubtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      setAppliedDiscount(Math.round(cartSubtotal * 0.1));
      alert('Coupon Applied Successfully: 10% Off!');
    } else {
      alert('Invalid or expired coupon code!');
    }
  };

  // Checkout and Order Placement
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert('Your cart is empty!');
    if (!customerAddress) return alert('Please input your delivery coordinates / address!');

    const cartSubtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const delCharge = baseDeliveryCharge + perKmCharge * 3; // Mock 3km distance
    const total = cartSubtotal + delCharge - appliedDiscount;
    const comm = Math.round(cartSubtotal * (commissionPercent / 100));

    const storeName = cart[0]?.store || 'Store';
    const merchantId = 'merch_' + storeName.replace(/\s+/g, '_').toLowerCase();

    const newOrder = {
      id: `PG-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      customerEmail,
      customerLocation: customerAddress,
      items: [...cart],
      totalAmount: total,
      deliveryCharge: delCharge,
      discountAmount: appliedDiscount,
      commissionAmount: comm,
      netMerchantEarning: total - comm,
      paymentMethod: selectedPayment,
      paymentStatus: selectedPayment === 'ONLINE' ? 'PAID' : 'PENDING',
      status: 'PLACED',
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryPartnerId: null,
      deliveryPartnerName: '',
      userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
      customerId: auth.currentUser ? auth.currentUser.uid : `guest_${customerPhone || 'anonymous'}`, // Relational link
      merchantId: merchantId, // Relational link
      merchantName: storeName,
      createdAt: new Date().toISOString()
    };

    try {
      // Save order to Firestore Database
      await addDoc(collection(db, "orders"), newOrder);

      // Auto-sync merchant profile doc if it does not exist
      try {
        const merchantDocRef = doc(db, "merchants", merchantId);
        const merchSnap = await getDoc(merchantDocRef);
        if (!merchSnap.exists()) {
          await setDoc(merchantDocRef, {
            storeName: storeName,
            category: cart[0]?.category || 'General',
            address: 'Store Address, Jaipur',
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Error auto-syncing merchant document:", err);
      }
      
      // Update local state for immediate UI tracking feedback
      setOrders([newOrder, ...orders]);
      setCart([]);
      setCouponCode('');
      setAppliedDiscount(0);
      setCurrentOrderTracking(newOrder.id);
      setIsTrackingDrawerOpen(true);
      alert(`Order Placed Successfully! Order ID: ${newOrder.id}. Saved to Firebase Database.`);
    } catch (error) {
      alert(`Failed to save order to Database: ${error.message}`);
    }
  };

  // Admin: Accept / Confirm Order
  const handleAdminAcceptOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update local state first
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'ACCEPTED' } : o));

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, { status: 'ACCEPTED' });
      } catch (err) {
        console.error("Error updating order status in Firestore:", err);
      }
    }
  };

  // Merchant: Accept / Confirm Order
  const handleMerchantAcceptOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update local state first
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'ACCEPTED' } : o));

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, { status: 'ACCEPTED' });
        showToast(`Order ${orderId} Accepted!`);
      } catch (err) {
        console.error("Error updating order status in Firestore:", err);
      }
    }
  };

  // Admin: Assign Rider to Order
  const handleAdminAssignRider = async (orderId, riderId) => {
    const rider = deliveryPartners.find(d => d.id === riderId);
    if (!rider) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update local state first
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'ASSIGNED',
          deliveryPartnerId: riderId,
          deliveryPartnerName: rider.name
        };
      }
      return o;
    }));

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, {
          status: 'ASSIGNED',
          deliveryPartnerId: riderId,
          deliveryPartnerName: rider.name,
          riderId: riderId // Normalized link
        });
      } catch (err) {
        console.error("Error assigning rider in Firestore:", err);
      }
    }

    // Sync busy status to delivery_boys collection
    try {
      const riderDocRef = doc(db, "delivery_boys", riderId);
      await setDoc(riderDocRef, {
        riderName: rider.name,
        riderPhone: rider.phone || '9251054064',
        vehicleNo: rider.vehicle || 'RJ-14-AB-1234',
        status: 'busy',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Error updating delivery boy status to busy in Firestore:", err);
    }

    // Alert simulation
    alert(`Delivery rider ${rider.name} assigned to Order ${orderId}. OTP ${order.otp} generated.`);
  };

  // Admin: Wipe database collections to start fresh
  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to delete all registered shops, registered riders, and total orders? This action is permanent and cannot be undone.")) {
      return;
    }

    try {
      showToast("🧹 Wiping database... Please wait.");

      // 1. Delete all merchants
      const merchantsQuery = await getDocs(collection(db, "merchants"));
      const merchantsDeletes = merchantsQuery.docs.map(docSnapshot => deleteDoc(doc(db, "merchants", docSnapshot.id)));
      await Promise.all(merchantsDeletes);

      // 2. Delete all riders (delivery_boys)
      const ridersQuery = await getDocs(collection(db, "delivery_boys"));
      const ridersDeletes = ridersQuery.docs.map(docSnapshot => deleteDoc(doc(db, "delivery_boys", docSnapshot.id)));
      await Promise.all(ridersDeletes);

      // 3. Delete all orders
      const ordersQuery = await getDocs(collection(db, "orders"));
      const ordersDeletes = ordersQuery.docs.map(docSnapshot => deleteDoc(doc(db, "orders", docSnapshot.id)));
      await Promise.all(ordersDeletes);

      // 4. Clear RTDB tracking paths
      try {
        await rtdbRemove(rtdbRef(rtdb, "deliveries"));
      } catch (rtdbErr) {
        console.warn("RTDB clean warning:", rtdbErr);
      }

      // 5. Clear local storage rider session
      localStorage.removeItem('pixigo_rider_session');

      showToast("🎉 Database cleared! Starting fresh.");
      alert("Database wiped successfully! Shops directory, riders directory, and orders are cleaned up.");
    } catch (err) {
      console.error("Error resetting database:", err);
      alert(`Failed to reset database: ${err.message}`);
    }
  };

  // Admin: Create & Authorize Rider (Direct Registration - Firestore Driven)
  const handleAdminCreateRider = async (e) => {
    e.preventDefault();
    if (!newRiderName || !newRiderPassword || !newRiderPhone || !newRiderVehicle || !newRiderEmail) {
      alert("Please fill in all Rider fields (Name, Email, Password, Phone, Vehicle).");
      return;
    }

    if (deliveryPartners.some(d => d.name.toLowerCase() === newRiderName.trim().toLowerCase())) {
      alert("This Rider Name / Username is already taken. Please choose a different name.");
      return;
    }

    if (deliveryPartners.some(d => (d.phone || '').trim() === newRiderPhone.trim())) {
      alert("This Phone Number is already registered to a Rider.");
      return;
    }

    if (deliveryPartners.some(d => (d.email || '').trim().toLowerCase() === newRiderEmail.trim().toLowerCase())) {
      alert("This Email Address is already registered to a Rider.");
      return;
    }

    const newRiderId = `rider_${Date.now()}`;
    const tempRiderName = newRiderName.trim();
    try {
      const riderDocRef = doc(db, "delivery_boys", newRiderId);
      await setDoc(riderDocRef, {
        id: newRiderId,
        name: tempRiderName,
        password: newRiderPassword,
        email: newRiderEmail.trim().toLowerCase(),
        phone: newRiderPhone.trim(),
        vehicle: newRiderVehicle.trim(),
        active: true,
        verified: true, // Directly verified
        totalDeliveries: 0,
        pendingPayout: 0,
        createdAt: new Date().toISOString()
      });

      setNewRiderName('');
      setNewRiderEmail('');
      setNewRiderPassword('');
      setNewRiderPhone('');
      setNewRiderVehicle('');
      
      alert(`Rider "${tempRiderName}" created & authorized successfully! They can log in immediately.`);
    } catch (error) {
      console.error("Admin Rider Creation Error:", error);
      alert(`Failed to create rider: ${error.message}`);
    }
  };



  // Admin: Create & Authorize Shop (Direct Registration - Firestore Driven)
  const handleAdminCreateShop = async (e) => {
    e.preventDefault();
    if (!newShopName || !newShopCategory || !newShopPhone || !newShopAddress || !newShopEmail) {
      alert("Please fill in all Shop fields (Name, Category, Phone, Address, Merchant Email).");
      return;
    }

    if (shops.some(s => (s.storeName || s.name || '').toLowerCase() === newShopName.trim().toLowerCase())) {
      alert("This Shop Name is already taken. Please choose a different name.");
      return;
    }

    const newShopId = `merch_${newShopName.trim().replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    const tempShopName = newShopName.trim();
    try {
      const merchantDocRef = doc(db, "merchants", newShopId);
      await setDoc(merchantDocRef, {
        id: newShopId,
        storeName: tempShopName,
        category: newShopCategory,
        phone: newShopPhone.trim(),
        address: newShopAddress.trim(),
        email: newShopEmail.trim().toLowerCase(),
        verified: true, // Directly verified
        status: 'active',
        createdAt: new Date().toISOString()
      });

      setNewShopName('');
      setNewShopCategory('General Store');
      setNewShopPhone('');
      setNewShopAddress('');
      setNewShopEmail('');
      
      alert(`Shop "${tempShopName}" registered & authorized successfully!`);
    } catch (error) {
      console.error("Admin Shop Creation Error:", error);
      alert(`Failed to create shop: ${error.message}`);
    }
  };

  // Admin: Start Editing Rider
  const handleStartEditRider = (rider) => {
    setEditingRider(rider);
    setEditRiderName(rider.name);
    setEditRiderPhone(rider.phone || '');
    setEditRiderVehicle(rider.vehicle || '');
    setEditRiderPassword(rider.password || '');
    setEditRiderEmail(rider.email || '');
    setIsEditRiderModalOpen(true);
  };

  // Admin: Save Rider Edits
  const handleSaveRiderEdit = async (e) => {
    e.preventDefault();
    if (!editRiderName || !editRiderPhone || !editRiderVehicle || !editRiderPassword || !editRiderEmail) {
      alert("Please fill in all fields.");
      return;
    }

    if (deliveryPartners.some(d => d.id !== editingRider.id && d.name.toLowerCase() === editRiderName.trim().toLowerCase())) {
      alert("This Rider Name is already taken by another Rider.");
      return;
    }

    if (deliveryPartners.some(d => d.id !== editingRider.id && (d.phone || '').trim() === editRiderPhone.trim())) {
      alert("This Phone Number is already registered to another Rider.");
      return;
    }

    if (deliveryPartners.some(d => d.id !== editingRider.id && (d.email || '').trim().toLowerCase() === editRiderEmail.trim().toLowerCase())) {
      alert("This Email Address is already registered to another Rider.");
      return;
    }

    try {
      const riderDocRef = doc(db, "delivery_boys", editingRider.id);
      const updatedData = {
        name: editRiderName.trim(),
        phone: editRiderPhone.trim(),
        vehicle: editRiderVehicle.trim(),
        password: editRiderPassword,
        email: editRiderEmail.trim().toLowerCase()
      };
      await setDoc(riderDocRef, updatedData, { merge: true });

      const savedRider = localStorage.getItem('pixigo_rider_session');
      if (savedRider) {
        const sessionData = JSON.parse(savedRider);
        if (sessionData.uid === editingRider.id) {
          const newSession = {
            ...sessionData,
            name: editRiderName.trim(),
            email: updatedData.email
          };
          localStorage.setItem('pixigo_rider_session', JSON.stringify(newSession));
          setUser(newSession);
        }
      }

      setIsEditRiderModalOpen(false);
      setEditingRider(null);
      alert("Rider details updated successfully in the database!");
    } catch (error) {
      console.error("Error editing rider:", error);
      alert(`Failed to update rider: ${error.message}`);
    }
  };

  // Admin: Open Shop Details
  const handleOpenShopDetails = (shop) => {
    setSelectedShopDetails(shop);
    setShopDocAadhaar(shop.hasAadhaar || false);
    setShopDocPan(shop.hasPan || false);
    setShopDocFssai(shop.hasFssai || false);
    setIsShopModalOpen(true);
  };

  const handleAdminSaveShopDocs = async () => {
    if (!selectedShopDetails) return;
    try {
      if (selectedShopDetails.firestoreId) {
        const docRef = doc(db, "merchants", selectedShopDetails.firestoreId);
        await updateDoc(docRef, {
          hasAadhaar: shopDocAadhaar,
          hasPan: shopDocPan,
          hasFssai: shopDocFssai
        });
      }
      // Update local shops state
      setShops(shops.map(s => s.id === selectedShopDetails.id ? { ...s, hasAadhaar: shopDocAadhaar, hasPan: shopDocPan, hasFssai: shopDocFssai } : s));
      showToast('Shop documents updated successfully!');
      setIsShopModalOpen(false);
      setSelectedShopDetails(null);
    } catch (err) {
      console.error("Error updating shop documents:", err);
      alert(`Failed to save document updates: ${err.message}`);
    }
  };

  // Admin: Catalog Approvals
  const handleAdminApproveProduct = async (prodId) => {
    try {
      await updateDoc(doc(db, "products", prodId), { approved: true });
      showToast('Product approved successfully!');
    } catch (e) {
      console.error("Error approving product:", e);
      alert(`Failed to approve product: ${e.message}`);
    }
  };

  const handleAdminEditAndApproveProduct = async (e) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;
    if (!editProductName || !editProductPrice) return alert('Please fill in product name and price!');
    try {
      await updateDoc(doc(db, "products", editingProduct.firestoreId), {
        name: editProductName,
        price: parseFloat(editProductPrice),
        category: editProductCategory,
        approved: true
      });
      showToast('Product edited and approved successfully!');
      setIsEditProductModalOpen(false);
      setEditingProduct(null);
    } catch (e) {
      console.error("Error editing/approving product:", e);
      alert(`Failed to edit/approve product: ${e.message}`);
    }
  };

  const handleAdminRejectProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to reject and delete this catalog request?')) return;
    try {
      await deleteDoc(doc(db, "products", prodId));
      showToast('Product request rejected and deleted.');
    } catch (e) {
      console.error("Error rejecting product:", e);
      alert(`Failed to reject product: ${e.message}`);
    }
  };

  // Admin: Verification Approvals
  const handleAdminVerifyUser = async (type, id, status) => {
    if (type === 'merchant') {
      const merchant = shops.find(s => s.id === id);
      if (merchant && merchant.firestoreId) {
        try {
          const docRef = doc(db, "merchants", merchant.firestoreId);
          await updateDoc(docRef, { verified: status, docs: status ? 'Approved' : 'Rejected' });
        } catch (err) {
          console.error("Error updating merchant verification in Firestore:", err);
        }
      }
      setShops(shops.map(s => s.id === id ? { ...s, verified: status, docs: status ? 'Approved' : 'Rejected' } : s));
    } else {
      const rider = deliveryPartners.find(d => d.id === id);
      if (rider && rider.firestoreId) {
        try {
          const docRef = doc(db, "delivery_boys", rider.firestoreId);
          await updateDoc(docRef, { verified: status });
        } catch (err) {
          console.error("Error updating rider verification in Firestore:", err);
        }
      }
      setDeliveryPartners(deliveryPartners.map(d => d.id === id ? { ...d, verified: status } : d));
    }
  };

  // Rider: Validate OTP and Deliver
  const [riderInputOTP, setRiderInputOTP] = useState('');
  const handleRiderCompleteDelivery = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.paymentMethod === 'ONLINE' && riderInputOTP !== order.otp) {
      return alert('Invalid OTP Code! Please confirm with the customer.');
    }

    // Stop Live GPS Tracking and clean up database
    if (riderWatchId) {
      navigator.geolocation.clearWatch(riderWatchId);
      setRiderWatchId(null);
      setRiderTrackingOrderId(null);
    }
    try {
      await rtdbRemove(rtdbRef(rtdb, `deliveries/${orderId}`));
    } catch (e) {
      console.error("Error removing RTDB node:", e);
    }

    // Update local state first
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          completedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          completedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error completing order in Firestore:", err);
      }
    }

    // Sync available status to delivery_boys collection
    if (order.deliveryPartnerId) {
      try {
        const riderDocRef = doc(db, "delivery_boys", order.deliveryPartnerId);
        await setDoc(riderDocRef, {
          status: 'available',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Error updating delivery boy status to available in Firestore:", err);
      }
    }

    // Update Rider totals
    setDeliveryPartners(deliveryPartners.map(d => {
      if (d.id === order.deliveryPartnerId) {
        return {
          ...d,
          totalDeliveries: d.totalDeliveries + 1,
          pendingPayout: d.pendingPayout + order.deliveryCharge
        };
      }
      return d;
    }));

    setRiderInputOTP('');
    alert(`Order ${orderId} delivered successfully! Payment captures and commissions computed.`);
  };

  const handleStartRiderTracking = (orderId) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    if (riderWatchId) {
      navigator.geolocation.clearWatch(riderWatchId);
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        rtdbSet(rtdbRef(rtdb, `deliveries/${orderId}`), {
          lat: latitude,
          lng: longitude,
          updatedAt: new Date().toISOString()
        });
      },
      (error) => {
        console.error("GPS Watch Position Error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    setRiderWatchId(watchId);
    setRiderTrackingOrderId(orderId);
    showToast("Live GPS tracking started for this order!");
  };

  const handleStopRiderTracking = () => {
    if (riderWatchId) {
      navigator.geolocation.clearWatch(riderWatchId);
      setRiderWatchId(null);
    }
    if (riderTrackingOrderId) {
      rtdbRemove(rtdbRef(rtdb, `deliveries/${riderTrackingOrderId}`));
      setRiderTrackingOrderId(null);
    }
    showToast("Live GPS tracking stopped.");
  };

  const handleRiderForgotPassword = () => {
    if (!authEmail) {
      setAuthError('Please enter your Rider Name / Username first, then click Forgot Password.');
      return;
    }
    const adminPhone = '919251054064';
    const message = `Hello Admin, I forgot my PixiGo Rider Password. My Rider Name is ${authEmail}. Please reset it.`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showToast("Redirecting to Admin WhatsApp for password reset...");
  };

  const handleUploadDocument = async (docType) => {
    if (!user) return alert('Please sign in first.');
    try {
      const riderDocRef = doc(db, "delivery_boys", user.uid);
      const updateData = {};
      updateData[`${docType}Uploaded`] = true;
      updateData['updatedAt'] = new Date().toISOString();
      await setDoc(riderDocRef, updateData, { merge: true });
      alert(`${docType.toUpperCase()} document uploaded successfully!`);
    } catch (err) {
      console.error(`Error uploading document ${docType}:`, err);
      alert(`Failed to upload: ${err.message}`);
    }
  };

  // Export database logs as CSV
  const handleExportCSV = () => {
    const headers = ['Order ID,Customer,Email,Location,Shop Name,Items,Total Amount,Payment,Status,OTP,Date\n'];
    const rows = orders.map(o => {
      const itemsList = o.items.map(i => `${i.name} (${i.quantity})`).join(' | ');
      return `"${o.id}","${o.customerName}","${o.customerEmail}","${o.customerLocation}","${o.items[0]?.store || 'Store'}","${itemsList}",${o.totalAmount},"${o.paymentMethod}","${o.status}","${o.otp}","${o.createdAt}"\n`;
    });

    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `PixiGo_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveDealOfTheDay = async () => {
    try {
      const dealDocRef = doc(db, "configs", "deal_of_the_day");
      await setDoc(dealDocRef, {
        text: dealTextEdit,
        image: dealImageEdit,
        active: dealActiveEdit,
        verticalOffset: dealVerticalOffsetEdit,
        horizontalOffset: dealHorizontalOffsetEdit,
        zoom: dealZoomEdit,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast("Deal of the Day updated successfully!");
      alert("Deal of the Day configurations saved to Firebase Firestore.");
    } catch (err) {
      console.error("Error saving Deal of the Day:", err);
      alert(`Failed to save deal configurations: ${err.message}`);
    }
  };

  // Merchant add custom product

  const handleMerchantAddProduct = async () => {
    if (!newProductName || !newProductPrice) return alert('Please fill in product name and price!');
    const newProd = {
      id: `p_${Date.now()}`,
      name: newProductName,
      price: parseFloat(newProductPrice),
      category: newProductCategory,
      store: merchantShopSelect,
      image: '🍔',
      approved: false,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, "products"), newProd);
      setNewProductName('');
      setNewProductPrice('');
      alert('Product added to listing catalog!');
    } catch (e) {
      console.error("Error adding product to Firestore:", e);
      alert(`Failed to add product: ${e.message}`);
    }
  };

  const handleMerchantDeleteProduct = async (id) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    if (prod.firestoreId) {
      try {
        await deleteDoc(doc(db, "products", prod.firestoreId));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error("Error deleting product from Firestore:", err);
        alert(`Failed to delete product: ${err.message}`);
      }
    } else {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const getUniqueProductNames = () => {
    const approved = products.filter(p => p.approved !== false);
    return [...new Set(approved.map(p => p.name))].sort();
  };

  const getUniqueStoreNames = () => {
    const approved = products.filter(p => p.approved !== false);
    return [...new Set(approved.map(p => p.store))].sort();
  };

  // Filter products by search, mode, and category
  const filteredProducts = products.filter(p => {
    if (p.approved === false) return false;
    let matchQuery = true;
    if (searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      if (searchMode === 'shop') {
        matchQuery = p.store.toLowerCase() === queryLower;
      } else if (searchMode === 'item') {
        matchQuery = p.name.toLowerCase() === queryLower;
      } else {
        matchQuery = p.name.toLowerCase().includes(queryLower) || 
                     p.store.toLowerCase().includes(queryLower);
      }
    }
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchQuery && matchCat;
  });

  // Compute active orders for the current customer (excluding completed and delivered ones)
  const activeCustomerOrders = orders.filter(o => {
    const emailVal = (o.customerEmail || o.email || '').trim().toLowerCase();
    const targetEmail = customerEmail.trim().toLowerCase();
    const isEmailMatch = emailVal === targetEmail;
    const isUidMatch = user && o.userId && o.userId === user.uid;
    const isPhoneMatch = o.customerPhone && o.customerPhone.trim() === customerPhone.trim();
    const isUserOrder = isEmailMatch || isUidMatch || isPhoneMatch;
    const isActive = o.status && o.status.toUpperCase() !== 'COMPLETED' && o.status.toUpperCase() !== 'DELIVERED';
    return isUserOrder && isActive;
  });

  const trackingOrderIdForHook = currentOrderTracking || activeCustomerOrders[0]?.id;
  const liveRiderCoords = useRiderLocation(trackingOrderIdForHook);

  // Reusable cart content rendering (sidebar & mobile drawer)
  const renderCartContent = (isDrawer = false) => {
    return (
      <div className={`cart-card ${!isDrawer ? 'glass-panel' : ''}`}>
        <div className="cart-header-row">
          <h2 className="section-title"><ShoppingCart size={20} /> My Cart</h2>
          {isDrawer && (
            <button className="close-drawer-btn" onClick={() => setIsCartDrawerOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>
        
        {cart.length === 0 ? (
          <div className="empty-cart-message">
            <AlertCircle size={36} className="text-muted" />
            <p>Your cart is empty. Add products from the catalog.</p>
            <button className="neon-btn shop-now-btn" style={{ marginTop: '12px', width: '100%' }} onClick={() => {
              setIsCartDrawerOpen(false);
              setIsMobileMenuOpen(false);
              setSelectedCategory('All');
              const catalog = document.querySelector('.catalog-section');
              if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
            }}>
              Shop Storefront Now
            </button>
          </div>
        ) : (
          <div className="cart-items-list">
            {cart.map(item => (
              <div key={item.id} className="cart-row">
                <div className="cart-item-img-wrap">
                  {item.image && item.image.startsWith('http') ? (
                    <img src={item.image} alt={item.name} className="cart-item-img" onError={(e) => {
                      e.target.style.display = 'none';
                    }} />
                  ) : (
                    <span className="cart-item-emoji">{item.image || item.emoji || '📦'}</span>
                  )}
                </div>
                <div className="cart-item-detail">
                  <h4>{item.name}</h4>
                  <span className="cart-item-sub">{formatINR(item.price)} each</span>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => handleUpdateQty(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQty(item.id, 1)}>+</button>
                </div>
                <button className="cart-item-remove" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <div className="divider"></div>

            {/* Coupons and Promos */}
            <div className="coupon-box">
              <input 
                type="text" 
                placeholder="Coupon (e.g. WELCOME100)" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                className="custom-input coupon-input"
              />
              <button className="neon-btn coupon-btn" onClick={handleApplyCoupon}>
                Apply
              </button>
            </div>

            {/* Pricing summary */}
            <div className="price-summary">
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>{formatINR(cart.reduce((acc, i) => acc + (i.price * i.quantity), 0))}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{formatINR(baseDeliveryCharge + perKmCharge * 3)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="summary-row discount-row">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(appliedDiscount)}</span>
                </div>
              )}
              <div className="divider"></div>
              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span>
                  {formatINR(
                    cart.reduce((acc, i) => acc + (i.price * i.quantity), 0) + 
                    (baseDeliveryCharge + perKmCharge * 3) - 
                    appliedDiscount
                  )}
                </span>
              </div>
            </div>

            <div className="policy-notice">
              <AlertCircle size={16} className="text-warning" />
              <span><strong>Policies:</strong> Non-refundable & Non-returnable order.</span>
            </div>

            <div className="divider"></div>

            {/* Delivery Form Info */}
            <div className="delivery-info-form">
              <h3 className="sub-header-title">Delivery Coordinates</h3>
              <input 
                type="text" 
                placeholder="Name" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                className="custom-input"
              />
              <input 
                type="text" 
                placeholder="Delivery Location Pin / Address" 
                value={customerAddress} 
                onChange={(e) => setCustomerAddress(e.target.value)} 
                className="custom-input"
              />
              <button
                type="button"
                className="auto-detect-btn"
                onClick={() => handleAutoDetectLocation(setCustomerAddress)}
                disabled={isLocating}
                style={{ marginBottom: '6px' }}
              >
                <Compass size={14} className={isLocating ? "spin" : ""} />
                {isLocating ? "Detecting location..." : "🎯 Auto-Detect My Location"}
              </button>

              {/* Interactive map adjustment for Customer */}
              <div className="leaflet-mock-map-sidebar border-glow" style={{ height: '140px', marginTop: '6px', marginBottom: '10px' }}>
                <LeafletMap
                  merchantCoords={{ lat: 26.9015, lng: 75.7482 }}
                  customerCoords={parseCoords(customerAddress)}
                  customerName={customerName || 'Customer'}
                  merchantName="Pixo Go Hub"
                  isInteractive={true}
                  onLocationChange={handleMapLocationChange}
                />
              </div>

              <div className="payment-select-grid">
                <button 
                  className={`pay-btn ${selectedPayment === 'ONLINE' ? 'active' : ''}`}
                  onClick={() => setSelectedPayment('ONLINE')}
                >
                  <DollarSign size={16} /> Online Pay (Razorpay)
                </button>
                <button 
                  className={`pay-btn ${selectedPayment === 'COD' ? 'active' : ''}`}
                  onClick={() => setSelectedPayment('COD')}
                >
                  <MapPin size={16} /> Cash on Delivery (COD)
                </button>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="neon-btn checkout-btn" onClick={() => {
              handlePlaceOrder();
              if (isDrawer) setIsCartDrawerOpen(false);
            }}>
              Confirm & Place Order <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPortalGuard = (portalName, children) => {
    if (!user) {
      const isRider = portalName === 'Delivery Rider';
      const showSignUpForm = (portalName === 'Admin Console') ? false : isSignUp;

      return (
        <div className="portal-auth-wrapper fade-in">
          <div className="portal-auth-card glass-panel border-glow">
            <div className="auth-icon-badge">
              {portalName === 'Admin Console' ? <Shield size={36} className="text-neon" /> :
               portalName === 'Delivery Rider' ? <Bike size={36} className="text-neon" /> :
               <Store size={36} className="text-neon" />}
            </div>
            <h2 className="auth-portal-title">{portalName}</h2>
            <p className="auth-portal-subtitle">Authentication Required to Access Staff Panel</p>

            {authError && (
              <div className={`auth-error-banner fade-in ${authError.toLowerCase().includes('sent') ? 'auth-info-banner' : ''}`}>
                {authError.toLowerCase().includes('sent') ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{authError}</span>
              </div>
            )}
            
            <form onSubmit={handleAuthAction} className="auth-form-premium">
              <div className="form-group-premium">
                <label className="form-label-premium">
                  {isRider ? 'Rider Name / Username' : 'Email Address'}
                </label>
                <input 
                  type={isRider ? 'text' : 'email'} 
                  placeholder={isRider ? 'Enter Rider Name' : 'Enter email address'} 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="custom-input-premium"
                  required
                />
              </div>

              {isRider && showSignUpForm && (
                <>
                  <div className="form-group-premium">
                    <label className="form-label-premium">Email ID</label>
                    <input 
                      type="email" 
                      placeholder="Enter email address" 
                      value={riderEmailInput}
                      onChange={(e) => setRiderEmailInput(e.target.value)}
                      className="custom-input-premium"
                      required
                    />
                  </div>
                  <div className="form-group-premium">
                    <label className="form-label-premium">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="Enter mobile number" 
                      value={riderPhoneInput}
                      onChange={(e) => setRiderPhoneInput(e.target.value)}
                      className="custom-input-premium"
                      required
                    />
                  </div>
                  <div className="form-group-premium">
                    <label className="form-label-premium">Vehicle Details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Activa (RJ-14-AB-1234)" 
                      value={riderVehicleInput}
                      onChange={(e) => setRiderVehicleInput(e.target.value)}
                      className="custom-input-premium"
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group-premium">
                <label className="form-label-premium">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="custom-input-premium"
                  required
                />
              </div>

              {!showSignUpForm && !isRider && (
                <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                  <button 
                    type="button" 
                    className="toggle-btn-link-premium" 
                    style={{ fontSize: '11px', opacity: 0.8 }} 
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {!showSignUpForm && isRider && (
                <div style={{ textAlign: 'center', marginTop: '4px', marginBottom: '8px' }}>
                  <button 
                    type="button" 
                    className="toggle-btn-link-premium" 
                    style={{ fontSize: '11px', opacity: 0.8 }} 
                    onClick={handleRiderForgotPassword}
                  >
                    Forgot Password? (WhatsApp Admin)
                  </button>
                </div>
              )}
              
              <button type="submit" className="neon-btn auth-submit-btn-premium">
                {showSignUpForm ? (isRider ? 'Register Rider Account' : 'Register Staff Account') : 'Sign In to Panel'}
              </button>
            </form>

            {!isRider && (
              <>
                <div className="divider"></div>
                <button 
                  className="google-auth-btn-premium" 
                  onClick={() => {
                    setAuthError('');
                    signInWithPopup(auth, googleProvider)
                      .then((result) => {
                        showToast(`Logged in successfully as ${result.user.displayName || result.user.email}!`);
                      })
                      .catch((error) => {
                        setAuthError(getFriendlyAuthError(error.message));
                      });
                  }}
                >
                  <span className="google-icon-premium">G</span> Sign In with Google
                </button>
              </>
            )}

            {isRider ? (
              <p className="auth-toggle-text-premium">
                {showSignUpForm ? 'Already registered?' : 'Need a new Rider Account?'} {' '}
                <button type="button" className="toggle-btn-link-premium" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
                  {showSignUpForm ? 'Sign In Instead' : 'Register Now'}
                </button>
              </p>
            ) : (!isRider && (
              <p className="auth-toggle-text-premium">
                {portalName === 'Admin Console' ? (
                  <>
                    Need a new panel account? {' '}
                    <button type="button" className="toggle-btn-link-premium" onClick={() => setAuthError('Request is sent to the administrator. Please contact your Administrator for the Admin Account.')}>
                      Create New Admin Account
                    </button>
                  </>
                ) : (
                  <>
                    {showSignUpForm ? 'Already registered?' : 'Need a new panel account?'} {' '}
                    <button type="button" className="toggle-btn-link-premium" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
                      {showSignUpForm ? 'Sign In Instead' : 'Create Account'}
                    </button>
                  </>
                )}
              </p>
            ))}
          </div>
        </div>
      );
    }
    if (portalName === 'Delivery Rider' && userRole !== 'admin') {
      const currentRider = deliveryPartners.find(d => d.id === user.uid || d.email === user.email);
      
      if (!currentRider) {
        return (
          <div className="portal-auth-wrapper fade-in">
            <div className="portal-auth-card glass-panel border-glow" style={{ textAlign: 'center', padding: '30px' }}>
              <div className="auth-icon-badge" style={{ margin: '0 auto 16px', background: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertCircle size={36} style={{ color: '#ef4444' }} />
              </div>
              <h2 className="auth-portal-title">Access Denied</h2>
              <p className="auth-portal-subtitle">
                You are not registered as an authorized Delivery Rider. Please contact the Admin.
              </p>
              <button className="neon-btn" onClick={handleLogout} style={{ marginTop: '20px', width: '100%' }}>
                Logout & Sign In Again
              </button>
            </div>
          </div>
        );
      }

      if (!currentRider.verified) {
        return (
          <div className="portal-auth-wrapper fade-in">
            <div className="portal-auth-card glass-panel border-glow" style={{ textAlign: 'center', padding: '30px' }}>
              <div className="auth-icon-badge" style={{ margin: '0 auto 16px', background: 'rgba(245, 158, 11, 0.1)' }}>
                <Activity size={36} style={{ color: '#f59e0b' }} />
              </div>
              <h2 className="auth-portal-title">Approval Pending</h2>
              <p className="auth-portal-subtitle">
                Your Rider account (<strong>{currentRider.name}</strong>) is currently pending admin verification. Your account verification is in process, please wait some time.
              </p>
              <div className="divider" style={{ margin: '20px 0' }}></div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Please message the Administrator to authorize your account:
              </p>
              <button 
                className="neon-btn" 
                onClick={() => {
                  const adminPhone = '919251054064';
                  const message = `Hello Admin, I have registered as a rider (${currentRider.name}). Please verify my account on the PixiGo console.`;
                  window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                style={{ background: '#25D366', color: '#fff', border: 'none', width: '100%', marginBottom: '12px' }}
              >
                Message Admin on WhatsApp
              </button>
              <button className="secondary-btn" onClick={handleLogout} style={{ width: '100%' }}>
                Logout
              </button>
            </div>
          </div>
        );
      }
    }

    return children;
  };


  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="app-header glass-panel">
        {/* Mobile menu trigger - placed first so it sits on the left on mobile */}
        {activeTab !== 'delivery' && activeTab !== 'admin' && activeTab !== 'merchant' && (
          <button className="cart-header-icon-btn mobile-menu-trigger-btn" onClick={() => setIsMobileMenuOpen(true)} title="Open Menu">
            <Menu size={20} />
          </button>
        )}

        <div className="header-logo">
          <div className="logo-text">
            <div className="logo-brand-name">
              <span className="brand-highlight">PIXI</span><span className="brand-light">go</span>
              {activeTab === 'delivery' && <span className="brand-light" style={{ fontSize: '15px', marginLeft: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>Rider Console</span>}
              {activeTab === 'admin' && <span className="brand-light" style={{ fontSize: '15px', marginLeft: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>Admin Console</span>}
              {activeTab === 'merchant' && <span className="brand-light" style={{ fontSize: '15px', marginLeft: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>Merchant Shop Console</span>}
            </div>
            <p className="tagline">Quick Home Delivery Service</p>
          </div>
        </div>

        {/* Admin Console Navigation in Header */}
        {activeTab === 'admin' && (
          <nav className="header-nav">
            <button 
              className={`nav-link ${adminSubView === 'orders' ? 'active' : ''}`}
              onClick={() => setAdminSubView('orders')}
            >
              <ShoppingCart size={16} style={{ marginRight: '6px' }} />
              Total Orders ({stats.totalOrders})
            </button>
            <button 
              className={`nav-link ${adminSubView === 'shops' ? 'active' : ''}`}
              onClick={() => setAdminSubView('shops')}
            >
              <Store size={16} style={{ marginRight: '6px' }} />
              Active Shops ({stats.activeMerchants})
            </button>
            <button 
              className={`nav-link ${adminSubView === 'riders' ? 'active' : ''}`}
              onClick={() => setAdminSubView('riders')}
            >
              <Bike size={16} style={{ marginRight: '6px' }} />
              Active Riders ({stats.activeRiders})
            </button>
            <button 
              className={`nav-link ${adminSubView === 'settings' ? 'active' : ''}`}
              onClick={() => setAdminSubView('settings')}
            >
              <Settings size={16} style={{ marginRight: '6px' }} />
              Settings
            </button>
            <div className="admin-header-profit-badge">
              <DollarSign size={14} />
              Profit: {formatINR(stats.netProfit)}
            </div>
          </nav>
        )}

        {/* Tab Controls (Desktop only) */}
        {activeTab !== 'delivery' && activeTab !== 'admin' && activeTab !== 'merchant' && (
          <nav className="header-nav desktop-only-nav">
            <button 
              className={`nav-link ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => handleTabChange('customer')}
            >
              <ShoppingCart size={18} />
              Customer View
            </button>
            {activeTab !== 'customer' && (
              <>
                <button 
                  className={`nav-link ${activeTab === 'admin' ? 'active font-neon' : ''}`}
                  onClick={() => handleTabChange('admin')}
                >
                  <Shield size={18} />
                  Admin Console
                </button>
                <button 
                  className={`nav-link ${activeTab === 'delivery' ? 'active' : ''}`}
                  onClick={() => handleTabChange('delivery')}
                >
                  <Bike size={18} />
                  Delivery Rider
                </button>
                <button 
                  className={`nav-link ${activeTab === 'merchant' ? 'active' : ''}`}
                  onClick={() => handleTabChange('merchant')}
                >
                  <Store size={18} />
                  Merchant Shop
                </button>
              </>
            )}
          </nav>
        )}

        {/* Header Actions (Auth, Cart & Mobile Menu) */}
        <div className="header-actions">
          {activeTab === 'customer' && (
            <button className="cart-header-icon-btn" onClick={() => setIsCartDrawerOpen(true)} title="View Cart">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="cart-badge-count-header">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}

          {activeTab === 'customer' && (
            <button className="cart-header-icon-btn" onClick={() => setIsProfileOpen(true)} title="My Profile & Orders">
              <User size={20} />
            </button>
          )}

          {activeTab === 'customer' && (
            <button className="cart-header-icon-btn" onClick={() => setIsContactOpen(true)} title="Contact Us">
              <Phone size={20} />
            </button>
          )}

          {user ? (
            <div className={`user-profile-menu ${['delivery', 'admin'].includes(activeTab) ? '' : 'desktop-only-auth'}`}>
              <span className="user-welcome">Hi, {user.name.split('@')[0]}</span>
              <button className="secondary-btn logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className={`neon-btn login-trigger-btn ${['delivery', 'admin'].includes(activeTab) ? '' : 'desktop-only-auth'}`} onClick={() => { setIsSignUp(false); setIsAuthModalOpen(true); }}>
              Sign In
            </button>
          )}

        </div>
      </header>

      {/* Main Portals Container */}
      <main className="portal-content">
        
        {/* ==================== CUSTOMER VIEW ==================== */}
        {activeTab === 'customer' && (
          <div className="customer-portal-layout fade-in">
            <div className="customer-grid">
            {/* Storefront Layout */}
            <div className="catalog-section">
              {/* Category selector */}
              <div className="cat-selector-scroll">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Dynamic Deal of the Day Banner */}
              {dealOfTheDay && dealOfTheDay.active && (
                <div className="deal-of-the-day-banner glass-panel fade-in border-glow" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  margin: '20px 0',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 242, 0.08) 0%, rgba(255, 0, 127, 0.08) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}>
                  {dealOfTheDay.image && (
                    <div className="deal-banner-image-wrap" style={{ flexShrink: 0, width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <img src={dealOfTheDay.image} alt="Deal of the Day" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${dealOfTheDay.horizontalOffset || '50'}% ${dealOfTheDay.verticalOffset || '50'}%`, transform: `scale(${dealOfTheDay.zoom || '1'})`, transformOrigin: 'center center', transition: 'transform 0.15s ease, object-position 0.15s ease' }} />
                    </div>
                  )}
                  <div className="deal-banner-content" style={{ flex: 1, textAlign: 'left' }}>
                    <span className="deal-banner-tag" style={{
                      background: 'linear-gradient(90deg, #ff007f, #00fff2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '12px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      display: 'inline-block',
                      marginBottom: '6px'
                    }}>
                      🔥 Deal of the Day
                    </span>
                    <h3 className="deal-banner-text" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      {dealOfTheDay.text}
                    </h3>
                    <button className="neon-btn small-btn" style={{ fontSize: '12px', padding: '6px 16px' }} onClick={() => {
                      const catalog = document.querySelector('.products-grid');
                      if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Claim Deal Now
                    </button>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="search-container border-glow">
                <div className="search-mode-select-wrap">
                  <select 
                    value={searchMode} 
                    onChange={(e) => {
                      setSearchMode(e.target.value);
                      setSearchQuery('');
                    }}
                    className="search-mode-select"
                  >
                    <option value="item">By Product</option>
                    <option value="shop">By Shop</option>
                  </select>
                </div>
                <div className="search-input-divider"></div>
                <div className="search-input-wrap" style={{ flex: 1 }}>
                  <Search size={18} className="search-bar-icon" />
                  {searchMode === 'item' ? (
                    <select
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input custom-select-dropdown"
                      style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', cursor: 'pointer' }}
                    >
                      <option value="" style={{ background: '#121212', color: '#888' }}>-- Select Product --</option>
                      {getUniqueProductNames().map(name => (
                        <option key={name} value={name} style={{ background: '#121212', color: '#fff' }}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input custom-select-dropdown"
                      style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', cursor: 'pointer' }}
                    >
                      <option value="" style={{ background: '#121212', color: '#888' }}>-- Select Shop --</option>
                      {getUniqueStoreNames().map(store => (
                        <option key={store} value={store} style={{ background: '#121212', color: '#fff' }}>{store}</option>
                      ))}
                    </select>
                  )}
                  {searchQuery && (
                    <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Grid */}
              <div className="products-grid">
                {filteredProducts.map(p => (
                  <div key={p.id} className="product-card glass-panel">
                    <div className="prod-img-wrap">
                      {p.image && p.image.startsWith('http') ? (
                        <img src={p.image} alt={p.name} className="prod-img" onError={(e) => {
                          e.target.style.display = 'none';
                        }} />
                      ) : (
                        <span className="prod-emoji-text">{p.image || p.emoji || '📦'}</span>
                      )}
                    </div>
                    <div className="prod-meta">
                      <h3 className="prod-title">{p.name}</h3>
                      <span className="prod-store">{p.store}</span>
                      <p className="prod-category">{p.category}</p>
                      <div className="prod-buy">
                        <span className="prod-price">{formatINR(p.price)}</span>
                        <button 
                          className="add-to-cart-btn" 
                          onClick={() => handleAddToCart(p)}
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> {/* Closes .catalog-section */}

            {/* Shopping Cart, Checkout & Live Status Sidebar (Right Side - Desktop only) */}
            <div className="checkout-sidebar desktop-only">
              {/* Live Order Status Sidebar Widget - Only active/live orders */}
              {activeCustomerOrders.length > 0 && (
                <div className="tracking-sidebar-card glass-panel mb-6 border-glow">
                  <div className="panel-header-sidebar">
                    <h3 className="section-title-sidebar"><Compass size={18} /> Live Tracking</h3>
                  </div>

                  {(() => {
                    const trackedOrder = activeCustomerOrders.find(o => o.id === currentOrderTracking) || activeCustomerOrders[0];
                    if (!trackedOrder) return null;

                    return (
                      <div className="tracked-order-detail-sidebar fade-in">
                        {/* Mini ETA banner */}
                        <div className="eta-banner-sidebar">
                          <span className="eta-countdown-sidebar">
                            {trackedOrder.status === 'COMPLETED' ? 'Delivered successfully!' : 
                             trackedOrder.status === 'ASSIGNED' ? 'Arriving in ~14 mins' :
                             trackedOrder.status === 'ACCEPTED' ? 'Preparing... ~22 mins' :
                             'Awaiting Confirmation'}
                          </span>
                        </div>

                        {/* Mini Map */}
                        <div className="leaflet-mock-map-sidebar border-glow">
                          <LeafletMap 
                            riderCoords={trackedOrder.id === trackingOrderIdForHook ? liveRiderCoords : null}
                            merchantCoords={{ lat: 26.9015, lng: 75.7482 }}
                            customerCoords={parseCoords(trackedOrder.customerLocation)}
                            customerName={extractFriendlyAddress(trackedOrder.customerLocation)}
                            merchantName={trackedOrder.items[0]?.store || 'Merchant'}
                          />
                        </div>

                        {/* Sidebar Details Grid */}
                        <div className="sidebar-details-grid">
                          <div className="sidebar-detail-row">
                            <span>Order:</span>
                            <strong>{trackedOrder.id}</strong>
                          </div>
                          <div className="sidebar-detail-row">
                            <span>Status:</span>
                            <span className={`badge ${trackedOrder.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                              {trackedOrder.status}
                            </span>
                          </div>
                          <div className="sidebar-detail-row">
                            <span>Payment:</span>
                            <span className="badge badge-info">{trackedOrder.paymentMethod}</span>
                          </div>
                        </div>

                        {/* Rider Information Panel */}
                        {trackedOrder.deliveryPartnerId ? (
                          <div className="rider-card-sidebar border-glow">
                            <div className="rider-avatar-sidebar">🛵</div>
                            <div className="rider-desc-sidebar">
                              <h4>{trackedOrder.deliveryPartnerName}</h4>
                              <p>Vehicle: {deliveryPartners.find(d => d.id === trackedOrder.deliveryPartnerId)?.vehicle.split(' (')[0] || '🛵'}</p>
                            </div>
                            <div className="otp-badge-sidebar">
                              <span>OTP: <strong>{trackedOrder.otp}</strong></span>
                            </div>
                          </div>
                        ) : (
                          <div className="rider-pending-sidebar">
                            <RefreshCw size={14} className="spin" />
                            <span>Assigning courier...</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Main Cart & Checkout Form */}
              {renderCartContent(false)}
            </div>
          </div> {/* Closes .customer-grid */}
        </div> /* Closes .customer-portal-layout */
      )}

        {/* ==================== ADMIN PORTAL ==================== */}
        {activeTab === 'admin' && renderPortalGuard('Admin Console', (
          <div className="admin-grid fade-in">
            {/* Dynamic Dashboard Subview Content */}
            {adminSubView === 'orders' && (<>
              <div className="admin-orders-table glass-panel fade-in">
                <div className="panel-header">
                  <h2>Active Order Operations</h2>
                  <button className="neon-btn csv-btn" onClick={handleExportCSV}>
                    <Download size={16} /> Export to Excel
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="order-log-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Info</th>
                        <th>Shop Info</th>
                        <th>Total Amt</th>
                        <th>Payment</th>
                        <th>Assigned Rider</th>
                        <th>OTP</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(o => o.status !== 'COMPLETED').length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                            No active orders currently running.
                          </td>
                        </tr>
                      ) : (
                        orders.filter(o => o.status !== 'COMPLETED').map(o => (
                          <tr key={o.id}>
                            <td><strong>{o.id}</strong></td>
                            <td>
                              <div>{o.customerName}</div>
                              <div className="sub-text">{o.customerPhone}</div>
                            </td>
                            <td>
                              <div>{o.items[0]?.store}</div>
                              <div className="sub-text">Category: {products.find(p => p.id === o.items[0]?.id)?.category}</div>
                            </td>
                            <td>{formatINR(o.totalAmount)}</td>
                            <td>
                              <span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                                {o.paymentMethod} ({o.paymentStatus})
                              </span>
                            </td>
                            <td>
                              {o.deliveryPartnerName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div className="badge badge-primary">{o.deliveryPartnerName}</div>
                                  {(() => {
                                    const assignedRider = deliveryPartners.find(d => d.id === o.deliveryPartnerId);
                                    const rPhone = assignedRider?.phone || '919251054064';
                                    return (
                                      <a 
                                        href={`https://wa.me/${rPhone}?text=${encodeURIComponent(`Hi ${o.deliveryPartnerName}, you have been assigned Order ${o.id} from ${o.items[0]?.store || 'Store'} on PixiGo. Please open your Rider Console to start delivery: http://localhost:5173/delivery`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="whatsapp-link-btn"
                                        title="Notify Rider on WhatsApp"
                                        style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '4px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                      >
                                        <MessageCircle size={14} />
                                      </a>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <select 
                                  className="rider-select"
                                  onChange={(e) => handleAdminAssignRider(o.id, e.target.value)}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign Rider...</option>
                                  {deliveryPartners.filter(d => d.verified && d.active).map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td><strong>{o.otp}</strong></td>
                            <td className="action-td">
                              {o.status === 'PLACED' && (
                                <button className="neon-btn small-btn" onClick={() => handleAdminAcceptOrder(o.id)}>
                                  Confirm Order
                                </button>
                              )}
                              <a 
                                href={`https://wa.me/${o.customerPhone}?text=Hi%20${o.customerName},%20your%20PixiGo%20Order%20from%20${o.items[0]?.store}%20is%20assigned.%20Your%20delivery%20OTP%20is%20${o.otp}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-link-btn"
                                title="WhatsApp Customer"
                              >
                                <MessageCircle size={18} />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Past Orders Toggle Section */}
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <button 
                  className="neon-btn" 
                  onClick={() => setShowPastOrders(!showPastOrders)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {showPastOrders ? "📂 Hide Past Orders" : "📁 View Past Orders"}
                </button>
              </div>

              {showPastOrders && (
                <div className="admin-orders-table glass-panel fade-in" style={{ marginTop: '20px' }}>
                  <div className="panel-header">
                    <h2>Past / Completed Orders</h2>
                  </div>

                  <div className="table-responsive">
                    <table className="order-log-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer Info</th>
                          <th>Shop Info</th>
                          <th>Total Amt</th>
                          <th>Payment</th>
                          <th>Completed Rider</th>
                          <th>OTP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.status === 'COMPLETED').length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                              No completed orders found.
                            </td>
                          </tr>
                        ) : (
                          orders.filter(o => o.status === 'COMPLETED').map(o => (
                            <tr key={o.id}>
                              <td><strong>{o.id}</strong></td>
                              <td>
                                <div>{o.customerName}</div>
                                <div className="sub-text">{o.customerPhone}</div>
                              </td>
                              <td>
                                <div>{o.items[0]?.store}</div>
                                <div className="sub-text">Category: {products.find(p => p.id === o.items[0]?.id)?.category}</div>
                              </td>
                              <td>{formatINR(o.totalAmount)}</td>
                              <td>
                                <span className="badge badge-success">
                                  {o.paymentMethod} ({o.paymentStatus})
                                </span>
                              </td>
                              <td>
                                <span className="badge badge-primary">{o.deliveryPartnerName || 'N/A'}</span>
                              </td>
                              <td><strong>{o.otp}</strong></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>)}

            {adminSubView === 'shops' && (
              <>
                <div className="admin-riders-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
                  <div className="admin-orders-table glass-panel fade-in" style={{ margin: 0 }}>
                    <div className="panel-header">
                      <h2>Registered Shops Directory ({shops.length})</h2>
                      <button className="neon-btn csv-btn" onClick={() => setAdminSubView('orders')}>
                        ← Back to Orders
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="order-log-table">
                        <thead>
                          <tr>
                            <th>Shop ID</th>
                            <th>Shop Name / Owner</th>
                            <th>Category</th>
                            <th>Phone Number</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shops.map(s => (
                            <tr 
                              key={s.id} 
                              onClick={() => handleOpenShopDetails(s)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td><strong>{s.id}</strong></td>
                              <td>{s.name}</td>
                              <td><span className="badge badge-info">{s.category}</span></td>
                              <td>{s.phone || 'N/A'}</td>
                              <td>
                                <span className={`badge ${s.verified ? 'badge-success' : 'badge-warning'}`}>
                                  {s.verified ? 'Verified & Active' : 'Pending Verification'}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="neon-btn small-btn" 
                                  onClick={(e) => { e.stopPropagation(); handleOpenShopDetails(s); }}
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add New Shop Form */}
                  <div className="glass-panel border-glow fade-in" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-main)' }}>Add & Authorize New Shop</h3>
                    <form onSubmit={handleAdminCreateShop} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Shop Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Fresh Mart"
                          value={newShopName}
                          onChange={(e) => setNewShopName(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Category</label>
                        <select 
                          value={newShopCategory}
                          onChange={(e) => setNewShopCategory(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        >
                          {categories.slice(1).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 9876543210"
                          value={newShopPhone}
                          onChange={(e) => setNewShopPhone(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Shop Address</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Vaishali Nagar, Jaipur"
                          value={newShopAddress}
                          onChange={(e) => setNewShopAddress(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Merchant Login Email</label>
                        <input 
                          type="email" 
                          placeholder="e.g. owner@gmail.com"
                          value={newShopEmail}
                          onChange={(e) => setNewShopEmail(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>

                      <button type="submit" className="neon-btn" style={{ marginTop: '8px', padding: '10px', width: '100%' }}>
                        Add & Onboard Shop
                      </button>
                    </form>
                  </div>
                </div>

                {/* Document Onboarding Applications (Merchants) */}
                <div className="approval-card glass-panel" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Merchant Verification Applications ({shops.filter(s => s.docs === 'Pending').length})</h2>
                    <button 
                      className="neon-btn small-btn" 
                      onClick={() => setIsMerchantApprovalsOpen(!isMerchantApprovalsOpen)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      {isMerchantApprovalsOpen ? 'Hide' : 'Show'} Applications
                    </button>
                  </div>
                  {isMerchantApprovalsOpen && (
                    <div className="approval-list fade-in">
                      {shops.map(s => (
                        <div key={s.id} className="approval-item">
                          <div className="approval-meta">
                            <h4>{s.name}</h4>
                            <p>Category: {s.category} | Mob: {s.phone}</p>
                            <div className="doc-pills">
                              <span className="doc-pill">Aadhaar Card</span>
                              <span className="doc-pill">PAN Card</span>
                              <span className="doc-pill">FSSAI Licence</span>
                            </div>
                          </div>
                          <div className="approval-actions">
                            {s.docs === 'Pending' ? (
                              <>
                                <button className="approve-btn" onClick={() => handleAdminVerifyUser('merchant', s.id, true)}>
                                  <Check size={16} style={{ marginRight: '4px' }} /> Approve
                                </button>
                                <button className="reject-btn" onClick={() => handleAdminVerifyUser('merchant', s.id, false)}>
                                  <X size={16} style={{ marginRight: '4px' }} /> Reject
                                </button>
                              </>
                            ) : (
                              <span className={`badge ${s.verified ? 'badge-success' : 'badge-danger'}`}>
                                {s.docs}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending Product Catalog Requests */}
                <div className="approval-card glass-panel" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Pending Product Catalog Requests ({products.filter(p => p.approved === false).length})</h2>
                    <button 
                      className="neon-btn small-btn" 
                      onClick={() => setIsProductApprovalsOpen(!isProductApprovalsOpen)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      {isProductApprovalsOpen ? 'Hide' : 'Show'} Requests
                    </button>
                  </div>
                  {isProductApprovalsOpen && (
                    <div className="approval-list fade-in">
                      {products.filter(p => p.approved === false).length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px' }}>No pending product catalog requests.</p>
                      ) : (
                        products.filter(p => p.approved === false).map(p => (
                          <div key={p.id || p.firestoreId} className="approval-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', marginBottom: '8px' }}>
                            <div className="approval-meta">
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>{p.name}</h4>
                              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                Shop: <strong>{p.store}</strong> | Price: <strong>{formatINR(p.price)}</strong> | Category: <span className="badge badge-info">{p.category}</span>
                              </p>
                            </div>
                            <div className="approval-actions" style={{ display: 'flex', gap: '8px' }}>
                              <button className="approve-btn" onClick={() => handleAdminApproveProduct(p.firestoreId)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px' }}>
                                <Check size={14} /> Approve
                              </button>
                              <button 
                                className="neon-btn small-btn" 
                                onClick={() => {
                                  setEditingProduct(p);
                                  setEditProductName(p.name);
                                  setEditProductPrice(p.price);
                                  setEditProductCategory(p.category);
                                  setIsEditProductModalOpen(true);
                                }} 
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px', background: 'rgba(0, 255, 242, 0.1)', border: '1px solid var(--color-neon-cyan)' }}
                              >
                                Edit & Approve
                              </button>
                              <button className="reject-btn" onClick={() => handleAdminRejectProduct(p.firestoreId)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px' }}>
                                <X size={14} /> Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {adminSubView === 'riders' && (
              <>
                <div className="admin-riders-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
                  <div className="admin-orders-table glass-panel fade-in" style={{ margin: 0 }}>
                    <div className="panel-header">
                      <h2>Registered Riders Directory ({deliveryPartners.length})</h2>
                      <button className="neon-btn csv-btn" onClick={() => setAdminSubView('orders')}>
                        ← Back to Orders
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="order-log-table">
                        <thead>
                          <tr>
                            <th>Rider ID</th>
                            <th>Rider Name</th>
                            <th>Vehicle</th>
                            <th>Phone Number</th>
                            <th>Total Deliveries</th>
                            <th>Pending Payout</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deliveryPartners.map(d => (
                            <tr key={d.id}>
                              <td><strong>{d.id}</strong></td>
                              <td>{d.name}</td>
                              <td>{d.vehicle || 'N/A'}</td>
                              <td>{d.phone || 'N/A'}</td>
                              <td>{d.totalDeliveries || 0}</td>
                              <td><strong>{formatINR(d.pendingPayout || 0)}</strong></td>
                              <td>
                                <span className={`badge ${d.verified ? 'badge-success' : 'badge-warning'}`}>
                                  {d.verified ? 'Verified & Active' : 'Pending Verification'}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="neon-btn small-btn" 
                                  onClick={(e) => { e.stopPropagation(); handleStartEditRider(d); }}
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="glass-panel border-glow fade-in" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-main)' }}>Add & Authorize New Rider</h3>
                    <form onSubmit={handleAdminCreateRider} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Rider Name (Username)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. JohnDoe"
                          value={newRiderName}
                          onChange={(e) => setNewRiderName(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Email ID</label>
                        <input 
                          type="email" 
                          placeholder="e.g. john@example.com"
                          value={newRiderEmail}
                          onChange={(e) => setNewRiderEmail(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={newRiderPassword}
                          onChange={(e) => setNewRiderPassword(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 9876543210"
                          value={newRiderPhone}
                          onChange={(e) => setNewRiderPhone(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Vehicle Details</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Splendor (RJ-14-SG-2024)"
                          value={newRiderVehicle}
                          onChange={(e) => setNewRiderVehicle(e.target.value)}
                          className="custom-input"
                          required
                          style={{ width: '100%' }}
                        />
                      </div>
                      <button type="submit" className="neon-btn" style={{ marginTop: '8px', padding: '10px', width: '100%' }}>
                        Add & Authorize Rider
                      </button>
                    </form>
                  </div>
                </div>

                {/* Delivery Boy Onboarding Verification list */}
                <div className="approval-card glass-panel" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Delivery Boy Onboarding Verification ({deliveryPartners.filter(d => !d.verified).length})</h2>
                    <button 
                      className="neon-btn small-btn" 
                      onClick={() => setIsRiderApprovalsOpen(!isRiderApprovalsOpen)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      {isRiderApprovalsOpen ? 'Hide' : 'Show'} Applications
                    </button>
                  </div>
                  {isRiderApprovalsOpen && (
                    <div className="approval-list fade-in">
                      {deliveryPartners.map(d => (
                        <div key={d.id} className="approval-item">
                          <div className="approval-meta">
                            <h4>{d.name}</h4>
                            <p>Vehicle: {d.vehicle} | Mob: {d.phone}</p>
                            <div className="doc-pills">
                              <span className="doc-pill">Driving Licence</span>
                              <span className="doc-pill">Vehicle RC</span>
                              <span className="doc-pill">PAN Card</span>
                            </div>
                          </div>
                          <div className="approval-actions">
                            {!d.verified ? (
                              <>
                                <button className="approve-btn" onClick={() => handleAdminVerifyUser('rider', d.id, true)}>
                                  <Check size={16} style={{ marginRight: '4px' }} /> Approve
                                </button>
                                <button className="reject-btn" onClick={() => handleAdminVerifyUser('rider', d.id, false)}>
                                  <X size={16} style={{ marginRight: '4px' }} /> Reject
                                </button>
                              </>
                            ) : (
                              <span className="badge badge-success">Approved & Active</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {adminSubView === 'settings' && (
              <div className="admin-settings-layout">
                {/* Left Column (Configurations) */}
                <div className="settings-col-left">
                  
                  {/* Panel 1: Global Configurations */}
                  <div className={`settings-accordion-section ${activeSettingsAccordion === 'global' ? 'active' : ''}`}>
                    <button 
                      type="button" 
                      className="settings-accordion-header"
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setActiveSettingsAccordion(activeSettingsAccordion === 'global' ? '' : 'global');
                        }
                      }}
                    >
                      <h2>
                        <Settings size={20} style={{ color: 'var(--color-primary)' }} />
                        <span>Global System Configurations</span>
                      </h2>
                      <ChevronDown size={20} className="accordion-chevron" />
                    </button>
                    
                    <div className="settings-accordion-content">
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Merchant Commission Percentage (%)</label>
                        <input 
                          type="number" 
                          value={commissionPercent} 
                          onChange={(e) => setCommissionPercent(parseFloat(e.target.value))} 
                          className="custom-input"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Base Delivery Charge (₹)</label>
                        <input 
                          type="number" 
                          value={baseDeliveryCharge} 
                          onChange={(e) => setBaseDeliveryCharge(parseFloat(e.target.value))} 
                          className="custom-input"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Per-Km Distance Fare (₹/km)</label>
                        <input 
                          type="number" 
                          value={perKmCharge} 
                          onChange={(e) => setPerKmCharge(parseFloat(e.target.value))} 
                          className="custom-input"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Gateway Bank Account</label>
                        <input 
                          type="text" 
                          value={bankAccount} 
                          onChange={(e) => setBankAccount(e.target.value)} 
                          className="custom-input"
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className="divider" style={{ margin: '16px 0', borderBottom: '1px solid var(--color-border)' }}></div>
                      
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Modify Storefront Categories</h4>
                      <div className="cat-admin-list">
                        {categories.slice(1).map(c => (
                          <span key={c} className="cat-badge" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', marginRight: '6px', marginBottom: '6px', fontSize: '12px' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Panel 2: Deal of the Day Configuration */}
                  <div className={`settings-accordion-section ${activeSettingsAccordion === 'deal' ? 'active' : ''}`}>
                    <button 
                      type="button" 
                      className="settings-accordion-header"
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setActiveSettingsAccordion(activeSettingsAccordion === 'deal' ? '' : 'deal');
                        }
                      }}
                    >
                      <h2>
                        <Tag size={20} style={{ color: 'var(--color-primary)' }} />
                        <span>Deal of the Day Configuration</span>
                      </h2>
                      <ChevronDown size={20} className="accordion-chevron" />
                    </button>
                    
                    <div className="settings-accordion-content">
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Deal Promo Text</label>
                        <input 
                          type="text" 
                          value={dealTextEdit} 
                          onChange={(e) => setDealTextEdit(e.target.value)} 
                          className="custom-input"
                          placeholder="e.g. Belgian Chocolate Waffle - Sweet Treat Cafe - Flat 20% Off!"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Deal Image URL</label>
                        <input 
                          type="text" 
                          value={dealImageEdit} 
                          onChange={(e) => setDealImageEdit(e.target.value)} 
                          className="custom-input"
                          placeholder="Enter image URL"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>
                          Image Zoom/Scale: {dealZoomEdit}x (1x Original, 3x Max Zoom)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" 
                            min="1" 
                            max="3" 
                            step="0.1" 
                            value={dealZoomEdit} 
                            onChange={(e) => setDealZoomEdit(e.target.value)} 
                            style={{ flex: 1, cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px', color: 'var(--color-text-main)', width: '35px', textAlign: 'right' }}>{dealZoomEdit}x</span>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>
                          Image Horizontal Alignment (X Offset): {dealHorizontalOffsetEdit}% (0% Left, 50% Center, 100% Right)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={dealHorizontalOffsetEdit} 
                            onChange={(e) => setDealHorizontalOffsetEdit(e.target.value)} 
                            style={{ flex: 1, cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px', color: 'var(--color-text-main)', width: '35px', textAlign: 'right' }}>{dealHorizontalOffsetEdit}%</span>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>
                          Image Vertical Alignment (Y Offset): {dealVerticalOffsetEdit}% (0% Top, 50% Center, 100% Bottom)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={dealVerticalOffsetEdit} 
                            onChange={(e) => setDealVerticalOffsetEdit(e.target.value)} 
                            style={{ flex: 1, cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px', color: 'var(--color-text-main)', width: '35px', textAlign: 'right' }}>{dealVerticalOffsetEdit}%</span>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px', flexDirection: 'row', alignItems: 'center', gap: '8px', display: 'flex' }}>
                        <input 
                          type="checkbox" 
                          id="deal-active-chk"
                          checked={dealActiveEdit} 
                          onChange={(e) => setDealActiveEdit(e.target.checked)} 
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="deal-active-chk" style={{ fontSize: '13px', color: 'var(--color-text-main)', cursor: 'pointer', userSelect: 'none', fontWeight: '500' }}>Make Deal of the Day Active</label>
                      </div>

                      <button className="neon-btn" onClick={handleSaveDealOfTheDay} style={{ alignSelf: 'flex-start', padding: '10px 24px', marginTop: '16px', width: '100%' }}>
                        Save Deal of the Day Settings
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Column (Previews & Guides) */}
                <div className="settings-col-right">

                  {/* Panel 3: Live Banner Preview */}
                  <div className={`settings-accordion-section ${activeSettingsAccordion === 'preview' ? 'active' : ''}`}>
                    <button 
                      type="button" 
                      className="settings-accordion-header"
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setActiveSettingsAccordion(activeSettingsAccordion === 'preview' ? '' : 'preview');
                        }
                      }}
                    >
                      <h2>
                        <Eye size={20} style={{ color: 'var(--color-primary)' }} />
                        <span>Live Banner Previews</span>
                      </h2>
                      <ChevronDown size={20} className="accordion-chevron" />
                    </button>
                    
                    <div className="settings-accordion-content">
                      <div className="preview-tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(15, 23, 42, 0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <button 
                          type="button"
                          className={`preview-tab-btn ${activePreviewTab === 'desktop' ? 'active' : ''}`}
                          onClick={() => setActivePreviewTab('desktop')}
                          style={{ flex: 1, padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease', background: activePreviewTab === 'desktop' ? 'var(--color-primary)' : 'transparent', color: activePreviewTab === 'desktop' ? '#000' : 'var(--color-text-muted)' }}
                        >
                          🖥️ Desktop View
                        </button>
                        <button 
                          type="button"
                          className={`preview-tab-btn ${activePreviewTab === 'mobile' ? 'active' : ''}`}
                          onClick={() => setActivePreviewTab('mobile')}
                          style={{ flex: 1, padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease', background: activePreviewTab === 'mobile' ? 'var(--color-primary)' : 'transparent', color: activePreviewTab === 'mobile' ? '#000' : 'var(--color-text-muted)' }}
                        >
                          📱 Mobile View
                        </button>
                      </div>

                      {activePreviewTab === 'desktop' ? (
                        <div className="desktop-preview-box fade-in" style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', background: 'rgba(0,0,0,0.02)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>🖥️ Desktop Monitor Layout</span>
                          <div className="deal-of-the-day-banner glass-panel border-glow" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(0, 255, 242, 0.08) 0%, rgba(255, 0, 127, 0.08) 100%)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            margin: 0
                          }}>
                            {dealImageEdit ? (
                              <div className="deal-banner-image-wrap" style={{ flexShrink: 0, width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <img src={dealImageEdit} alt="Preview" style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: `${dealHorizontalOffsetEdit}% ${dealVerticalOffsetEdit}%`,
                                  transform: `scale(${dealZoomEdit})`,
                                  transformOrigin: 'center center',
                                  transition: 'transform 0.1s ease, object-position 0.1s ease'
                                }} />
                              </div>
                            ) : (
                              <div style={{ width: '100px', height: '100px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🖼️</div>
                            )}
                            <div style={{ flex: 1, textAlign: 'left' }}>
                              <span className="deal-banner-tag" style={{ background: 'linear-gradient(90deg, #ff007f, #00fff2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🔥 Deal of the Day</span>
                              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)', margin: '0 0 6px 0', lineHeight: '1.4' }}>{dealTextEdit || 'Belgian Chocolate Waffle - Sweet Treat Cafe - Flat 20% Off!'}</h3>
                              <button className="neon-btn small-btn" style={{ fontSize: '10px', padding: '4px 12px' }} disabled>Claim Deal Now</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mobile-preview-box fade-in" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <div style={{ width: '100%', maxWidth: '340px', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '12px', background: 'rgba(0,0,0,0.02)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>📱 Mobile Phone Simulator</span>
                            <div className="deal-of-the-day-banner glass-panel border-glow" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'stretch',
                              gap: '12px',
                              padding: '12px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, rgba(0, 255, 242, 0.08) 0%, rgba(255, 0, 127, 0.08) 100%)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              margin: 0
                            }}>
                              {dealImageEdit ? (
                                <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <img src={dealImageEdit} alt="Preview" style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: `${dealHorizontalOffsetEdit}% ${dealVerticalOffsetEdit}%`,
                                    transform: `scale(${dealZoomEdit})`,
                                    transformOrigin: 'center center',
                                    transition: 'transform 0.1s ease, object-position 0.1s ease'
                                  }} />
                                </div>
                              ) : (
                                <div style={{ width: '100%', height: '140px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🖼️</div>
                              )}
                              <div style={{ textAlign: 'left' }}>
                                <span className="deal-banner-tag" style={{ background: 'linear-gradient(90deg, #ff007f, #00fff2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '10px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🔥 Deal of the Day</span>
                                <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)', margin: '0 0 6px 0', lineHeight: '1.4' }}>{dealTextEdit || 'Belgian Chocolate Waffle - Sweet Treat Cafe - Flat 20% Off!'}</h3>
                                <button className="neon-btn small-btn" style={{ fontSize: '9px', padding: '4px 10px', width: '100%' }} disabled>Claim Deal Now</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel 4: Image Upload Guide */}
                  <div className={`settings-accordion-section ${activeSettingsAccordion === 'guide' ? 'active' : ''}`}>
                    <button 
                      type="button" 
                      className="settings-accordion-header"
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setActiveSettingsAccordion(activeSettingsAccordion === 'guide' ? '' : 'guide');
                        }
                      }}
                    >
                      <h2>
                        <FileText size={20} style={{ color: 'var(--color-primary)' }} />
                        <span>📷 Image Upload Guide</span>
                      </h2>
                      <ChevronDown size={20} className="accordion-chevron" />
                    </button>
                    
                    <div className="settings-accordion-content">
                      <div className="guide-methods-grid">
                        <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.02)' }}>
                          <h4 style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>METHOD A (POSTIMAGES)</h4>
                          <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                            <li>Go to <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', textDecoration: 'underline', fontWeight: '600' }}>Postimages.org</a>.</li>
                            <li>Upload your photo and copy the <strong>"Direct Link"</strong>.</li>
                            <li>Paste it into the <strong>Deal Image URL</strong> field.</li>
                          </ol>
                        </div>

                        <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.02)' }}>
                          <h4 style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>METHOD B (FREEIMAGE.HOST)</h4>
                          <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                            <li>Go to <a href="https://freeimage.host" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', textDecoration: 'underline', fontWeight: '600' }}>Freeimage.host</a>.</li>
                            <li>Upload image from your computer.</li>
                            <li>Once uploaded, open it in a new tab.</li>
                            <li>Select <strong>"Copy image address"</strong> (or "Copy image link").</li>
                            <li>Paste the link into the URL field.</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        ))
      }

        {/* ==================== DELIVERY RIDER PORTAL ==================== */}
        {activeTab === 'delivery' && renderPortalGuard('Delivery Rider', (() => {
          const currentRider = deliveryPartners.find(d => d.id === user?.uid);
          
          const isAadhaarUploaded = currentRider?.aadhaarUploaded || false;
          const isDlUploaded = currentRider?.dlUploaded || false;
          const isRcUploaded = currentRider?.rcUploaded || false;
          const isPanUploaded = currentRider?.panUploaded || false;
          const isAllUploaded = isAadhaarUploaded && isDlUploaded && isRcUploaded && isPanUploaded;
          
          const activeJobs = orders.filter(o => o.deliveryPartnerId === user?.uid && o.status !== 'COMPLETED');
          const completedJobs = orders.filter(o => {
            if (o.deliveryPartnerId !== user?.uid || o.status !== 'COMPLETED') return false;
            const dateVal = o.completedAt || o.createdAt;
            if (!dateVal) return false;
            try {
              return new Date(dateVal).toDateString() === new Date().toDateString();
            } catch (err) {
              return false;
            }
          });
          
          return (
            <div className="delivery-portal-wrap fade-in">
              <div className="delivery-layout glass-panel">
                
                {/* Rider Welcome Info */}
                <div style={{ textAlign: 'left', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                    Welcome, {user?.name || user?.email}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Logged in as: <strong>{user?.email}</strong>
                  </p>
                </div>

                {/* Rider Stats Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {activeJobs.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Active Runs</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-info)' }}>
                      {completedJobs.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Completed Jobs</div>
                  </div>
                </div>

                {/* Rider Active Orders */}
                <div className="rider-orders-section">
                  <h2>Assigned Delivery Jobs ({activeJobs.length})</h2>
                  {activeJobs.length === 0 ? (
                    <div className="no-jobs-card">
                      <Bike size={32} className="text-muted" />
                      <p>No active delivery runs assigned to you at the moment.</p>
                    </div>
                  ) : (
                    activeJobs.map(o => (
                      <div key={o.id} className="job-card glass-panel" style={{ marginBottom: '20px' }}>
                        <div className="job-header">
                          <div style={{ textAlign: 'left' }}>
                            <h3 style={{ margin: 0 }}>Order {o.id}</h3>
                            <span className="badge badge-warning" style={{ marginTop: '4px', display: 'inline-block' }}>{o.status}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Your Earning</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                              {formatINR(o.deliveryCharge || 0)}
                            </div>
                          </div>
                        </div>

                        <div className="job-info-grid">
                          <div className="job-meta-box" style={{ textAlign: 'left' }}>
                            <h4>🏪 Merchant Pickup</h4>
                            <p><strong>Shop:</strong> {o.items[0]?.store}</p>
                            <p><strong>Location:</strong> Vaishali Market Area, Jaipur</p>
                            <a href={`tel:9251054064`} className="phone-link-btn" style={{ marginTop: '8px', display: 'inline-flex' }}>
                              <Phone size={14} style={{ marginRight: '6px' }} /> Call Shop Owner
                            </a>
                          </div>

                          <div className="job-meta-box" style={{ textAlign: 'left' }}>
                            <h4>🏠 Customer Delivery</h4>
                            <p><strong>Name:</strong> {o.customerName}</p>
                            <p><strong>Address:</strong> {o.customerLocation}</p>
                            <p><strong>Phone:</strong> {o.customerPhone || '9251054064'}</p>
                            <p><strong>Collect Payment:</strong> <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{formatINR(o.totalAmount)}</span> ({o.paymentMethod})</p>
                            <a href={`tel:${o.customerPhone || '9251054064'}`} className="phone-link-btn" style={{ marginTop: '8px', display: 'inline-flex' }}>
                              <Phone size={14} style={{ marginRight: '6px' }} /> Call Customer
                            </a>
                          </div>
                        </div>

                        <div className="rider-tracking-controls" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                          {riderTrackingOrderId === o.id ? (
                            <button 
                              className="neon-btn" 
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', flexGrow: 1 }}
                              onClick={handleStopRiderTracking}
                            >
                              🔴 Stop Live GPS Tracking
                            </button>
                          ) : (
                            <button 
                              className="neon-btn" 
                              style={{ flexGrow: 1 }}
                              onClick={() => handleStartRiderTracking(o.id)}
                            >
                              🟢 Start Live Ride Tracking
                            </button>
                          )}
                        </div>

                        <div className="job-otp-form" style={{ marginTop: '20px' }}>
                          <input 
                            type="text" 
                            placeholder="Enter Customer Delivery OTP" 
                            value={riderInputOTP}
                            onChange={(e) => setRiderInputOTP(e.target.value)}
                            className="custom-input"
                          />
                          <button className="neon-btn" onClick={() => handleRiderCompleteDelivery(o.id)}>
                            Complete Delivery & Collect Cash
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Rider Completed Orders */}
                {completedJobs.length > 0 && (
                  <div className="rider-orders-section" style={{ marginTop: '32px' }}>
                    <h2>Completed Deliveries ({completedJobs.length})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {completedJobs.map(o => (
                        <div key={o.id} className="glass-panel" style={{
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderRadius: '12px'
                        }}>
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{ margin: 0, color: 'var(--color-text-main)' }}>Order {o.id}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              Store: {o.items[0]?.store} | Customer: {o.customerName}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-success" style={{ display: 'inline-block', marginBottom: '4px' }}>Delivered ✓</span>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                              +{formatINR(o.deliveryCharge || 0)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })())}

        {/* ==================== MERCHANT DASHBOARD ==================== */}
        {activeTab === 'merchant' && renderPortalGuard('Merchant Dashboard', (() => {
          const merchantOrders = orders.filter(o => 
            o.merchantName === currentMerchantShopName || 
            (o.items && o.items.some(i => i.store === currentMerchantShopName))
          );

          const todaysMerchantOrders = merchantOrders.filter(o => {
            const dateVal = o.completedAt || o.createdAt;
            if (!dateVal) return false;
            try {
              return new Date(dateVal).toDateString() === new Date().toDateString();
            } catch (err) {
              return false;
            }
          });

          const ongoingMerchantOrders = merchantOrders.filter(o => 
            ['ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'STARTED', 'OUT_FOR_DELIVERY'].includes(o.status)
          );

          const pendingMerchantOrders = merchantOrders.filter(o => 
            ['PLACED', 'PENDING'].includes(o.status)
          );

          return (
            <div className="merchant-portal-wrap fade-in">
              <div className="merchant-layout glass-panel">
                
                {/* Associated Shop Welcome */}
                <div style={{ textAlign: 'left', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                    Welcome, {currentMerchantShopName || 'Merchant Shop'}
                  </h2>
                  {loggedInMerchantShop ? (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Shop Location: <strong>{loggedInMerchantShop.address}</strong> | Category: <strong>{loggedInMerchantShop.category}</strong> | Contact: <strong>{loggedInMerchantShop.phone}</strong>
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Logged in as: <strong>{user?.email}</strong>. If your shop is not linked, please contact the Administrator.
                    </p>
                  )}
                </div>

                {/* Merchant Stats Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {todaysMerchantOrders.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Today's Total Orders</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                      {ongoingMerchantOrders.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Ongoing Deliveries</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                      {pendingMerchantOrders.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Upcoming Pending Orders</div>
                  </div>
                </div>

                {/* Upcoming / Pending Orders */}
                <div className="merchant-orders-section" style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-main)', textAlign: 'left' }}>Upcoming / Pending Orders ({pendingMerchantOrders.length})</h3>
                  {pendingMerchantOrders.length === 0 ? (
                    <div className="no-jobs-card" style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ color: 'var(--color-text-muted)' }}>No pending orders waiting to be accepted.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {pendingMerchantOrders.map(o => (
                        <div key={o.id} className="job-card glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{ margin: 0, color: 'var(--color-text-main)' }}>Order {o.id}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              Customer: {o.customerName} | Address: {o.customerLocation}
                            </span>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-main)' }}>
                              <strong>Items:</strong> {o.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>{formatINR(o.totalAmount)}</div>
                            <button className="neon-btn small-btn" onClick={() => handleMerchantAcceptOrder(o.id)}>
                              Accept Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ongoing Deliveries */}
                <div className="merchant-orders-section" style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-main)', textAlign: 'left' }}>Ongoing Deliveries ({ongoingMerchantOrders.length})</h3>
                  {ongoingMerchantOrders.length === 0 ? (
                    <div className="no-jobs-card" style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ color: 'var(--color-text-muted)' }}>No active ongoing deliveries at the moment.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {ongoingMerchantOrders.map(o => (
                        <div key={o.id} className="job-card glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{ margin: 0, color: 'var(--color-text-main)' }}>Order {o.id}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              Customer: {o.customerName} | Rider: <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{o.deliveryPartnerName || 'Assigning Rider...'}</span>
                            </span>
                            <div style={{ marginTop: '4px' }}>
                              <span className="badge badge-warning">{o.status}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>{formatINR(o.totalAmount)}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{o.paymentMethod}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="divider" style={{ margin: '32px 0' }}></div>

                {/* Keep existing Onboarding and Catalog forms */}
                <div className="merchant-onboarding">
                  <h2 style={{ textAlign: 'left' }}>Merchant Onboarding Form</h2>
                  <div className="document-upload-grid">
                    <div className="doc-uploader">
                      <span>GST Document (Optional)</span>
                      <button className="upload-box-btn" onClick={() => alert('GST Document uploaded!')}>
                        Select File
                      </button>
                    </div>
                    <div className="doc-uploader">
                      <span>Shop Registration Certificate</span>
                      <button className="upload-box-btn" onClick={() => alert('Shop registration certificate uploaded!')}>
                        Select File
                      </button>
                    </div>
                    <div className="doc-uploader">
                      <span>Shop Photo & GPS Location</span>
                      <button className="upload-box-btn" onClick={() => alert('Shop photo coordinates set!')}>
                        Select File
                      </button>
                    </div>
                    <div className="doc-uploader">
                      <span>FSSAI License (Food shops only)</span>
                      <button className="upload-box-btn" onClick={() => alert('FSSAI License uploaded!')}>
                        Select File
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divider" style={{ margin: '32px 0' }}></div>

                <div className="merchant-management-grid">
                  {/* Catalog Creator */}
                  <div className="catalog-creator">
                    <h2 style={{ textAlign: 'left' }}>Add Product to Catalog</h2>
                    <div className="form-group">
                      <label>Product Name</label>
                      <input 
                        type="text" 
                        value={newProductName} 
                        onChange={(e) => setNewProductName(e.target.value)} 
                        className="custom-input" 
                        placeholder="e.g. Vanilla Butter Cake"
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input 
                        type="number" 
                        value={newProductPrice} 
                        onChange={(e) => setNewProductPrice(e.target.value)} 
                        className="custom-input" 
                        placeholder="e.g. 350"
                      />
                    </div>
                    <div className="form-group">
                      <label>Product Category</label>
                      <select 
                        value={newProductCategory} 
                        onChange={(e) => setNewProductCategory(e.target.value)}
                        className="rider-select"
                      >
                        {categories.slice(1).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Representing Shop</label>
                      <select 
                        value={merchantShopSelect} 
                        onChange={(e) => setMerchantShopSelect(e.target.value)}
                        className="rider-select"
                      >
                        {shops.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <button className="neon-btn" onClick={handleMerchantAddProduct}>
                      Add Product Listing
                    </button>
                  </div>

                  {/* Listed Products */}
                  <div className="listed-products">
                    <h2 style={{ textAlign: 'left' }}>My Listed Products ({products.filter(p => p.store === merchantShopSelect).length})</h2>
                    <div className="listed-items-container">
                      {products.filter(p => p.store === merchantShopSelect).map(p => (
                        <div key={p.id} className="listed-item-row">
                          <div className="item-details">
                            {p.image && p.image.startsWith('http') ? (
                              <img src={p.image} alt={p.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                            ) : (
                              <span className="item-emoji">{p.image || p.emoji || '📦'}</span>
                            )}
                            <div>
                              <h4>{p.name}</h4>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                <span className="badge badge-info">{p.category}</span>
                                {p.approved === false && <span className="badge badge-warning" style={{ textTransform: 'uppercase', fontSize: '9px', padding: '2px 4px' }}>Pending Approval</span>}
                                {p.approved === true && <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '9px', padding: '2px 4px' }}>Approved</span>}
                              </div>
                            </div>
                          </div>
                          <div className="item-price-delete">
                            <span>{formatINR(p.price)}</span>
                            <button className="delete-btn-link" onClick={() => handleMerchantDeleteProduct(p.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })())}
      </main>

      {/* Mobile Cart Drawer Overlay */}
      {isCartDrawerOpen && (
        <div className="drawer-backdrop fade-in" onClick={() => setIsCartDrawerOpen(false)}>
          <div className="cart-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            {renderCartContent(true)}
          </div>
        </div>
      )}

      {/* Floating Mobile Cart Button */}
      {activeTab === 'customer' && cart.length > 0 && (
        <button className="floating-cart-btn mobile-only pulse-glow" onClick={() => setIsCartDrawerOpen(true)}>
          <ShoppingCart size={24} />
          <span className="cart-badge-count-floating">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </button>
      )}

      {/* Firebase Authentication Modal */}
      {isAuthModalOpen && (
        <div className="modal-backdrop fade-in" onClick={() => { setIsAuthModalOpen(false); setAuthError(''); }}>
          <div className="auth-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setIsAuthModalOpen(false); setAuthError(''); }}>
              <X size={20} />
            </button>
            
            <div className="auth-icon-badge">
              <User size={36} className="text-neon" />
            </div>
            
            <div className="auth-modal-header" style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 className="auth-portal-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-portal-subtitle">Access your PixiGo Delivery dashboard</p>
            </div>

            {authError && (
              <div className={`auth-error-banner fade-in ${authError.toLowerCase().includes('sent') ? 'auth-info-banner' : ''}`}>
                {authError.toLowerCase().includes('sent') ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{authError}</span>
              </div>
            )}
            
            <form onSubmit={handleAuthAction} className="auth-form-premium">
              <div className="form-group-premium">
                <label className="form-label-premium">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="custom-input-premium"
                  required
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="custom-input-premium"
                  required
                />
              </div>

              {!isSignUp && (
                <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                  <button 
                    type="button" 
                    className="toggle-btn-link-premium" 
                    style={{ fontSize: '11px', opacity: 0.8 }} 
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              
              <button type="submit" className="neon-btn auth-submit-btn-premium">
                {isSignUp ? 'Create PixiGo Account' : 'Sign In'}
              </button>
            </form>

            <div className="divider"></div>

            <button 
              className="google-auth-btn-premium" 
              onClick={() => {
                setAuthError('');
                signInWithPopup(auth, googleProvider)
                  .then((result) => {
                    showToast(`Welcome back, ${result.user.displayName || result.user.email}!`);
                    setIsAuthModalOpen(false);
                  })
                  .catch((error) => {
                    setAuthError(getFriendlyAuthError(error.message));
                  });
              }}
            >
              <span className="google-icon-premium">G</span> Sign In with Google
            </button>

            <p className="auth-toggle-text-premium">
              {isSignUp ? 'Already registered?' : 'Need a new account?'} {' '}
              <button className="toggle-btn-link-premium" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
                {isSignUp ? 'Sign In Instead' : 'Sign Up Now'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="modal-backdrop fade-in" onClick={() => setIsProfileOpen(false)}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsProfileOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="profile-avatar-section">
              <div className="profile-avatar-glow">
                <User size={40} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="section-title-premium">Edit Profile Settings</h3>
              <p className="profile-sub">{customerEmail}</p>
            </div>
            
            <form onSubmit={handleSaveProfile} className="profile-form-premium">
              <div className="form-group-premium">
                <label className="form-label-premium">Full Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  className="custom-input-premium"
                  required
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Phone Number</label>
                <input 
                  type="text" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  className="custom-input-premium"
                  required
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Delivery Address Coordinates</label>
                <textarea 
                  value={customerAddress} 
                  onChange={(e) => setCustomerAddress(e.target.value)} 
                  className="custom-input-premium address-textarea-premium"
                  rows="3"
                  required
                />
                <button
                  type="button"
                  className="auto-detect-btn"
                  onClick={() => handleAutoDetectLocation(setCustomerAddress)}
                  disabled={isLocating}
                >
                  <Compass size={14} className={isLocating ? "spin" : ""} />
                  {isLocating ? "Detecting location..." : "🎯 Auto-Detect My Location"}
                </button>
                <div className="leaflet-mock-map-sidebar border-glow" style={{ height: '130px', marginTop: '8px' }}>
                  <LeafletMap
                    merchantCoords={{ lat: 26.9015, lng: 75.7482 }}
                    customerCoords={parseCoords(customerAddress)}
                    customerName={customerName || 'Customer'}
                    merchantName="Pixo Go Hub"
                    isInteractive={true}
                    onLocationChange={handleMapLocationChange}
                  />
                </div>
              </div>
              <button type="submit" className="neon-btn save-profile-btn-premium">
                Save & Apply Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Past Orders Modal */}
      {isPastOrdersOpen && (
        <div className="modal-backdrop fade-in" onClick={() => setIsPastOrdersOpen(false)}>
          <div className="past-orders-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsPastOrdersOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header-premium">
              <h3 className="section-title-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><FileText size={22} className="text-neon" /> Past Orders History</h3>
              <p className="profile-sub">Review your completed deliveries</p>
            </div>

            <div className="past-orders-list-premium">
              {orders.filter(o => {
                const emailVal = (o.customerEmail || o.email || '').trim().toLowerCase();
                const targetEmail = customerEmail.trim().toLowerCase();
                const isEmailMatch = emailVal === targetEmail;
                const isUidMatch = user && o.userId && o.userId === user.uid;
                const isPhoneMatch = o.customerPhone && o.customerPhone.trim() === customerPhone.trim();
                const isCompleted = o.status && (o.status.toUpperCase() === 'COMPLETED' || o.status.toUpperCase() === 'DELIVERED');
                return (isEmailMatch || isUidMatch || isPhoneMatch) && isCompleted;
              }).length === 0 ? (
                <div className="no-past-orders-premium">
                  <ShoppingCart size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
                  <p>You have no past completed orders.</p>
                </div>
              ) : (
                orders.filter(o => {
                  const emailVal = (o.customerEmail || o.email || '').trim().toLowerCase();
                  const targetEmail = customerEmail.trim().toLowerCase();
                  const isEmailMatch = emailVal === targetEmail;
                  const isUidMatch = user && o.userId && o.userId === user.uid;
                  const isPhoneMatch = o.customerPhone && o.customerPhone.trim() === customerPhone.trim();
                  const isCompleted = o.status && (o.status.toUpperCase() === 'COMPLETED' || o.status.toUpperCase() === 'DELIVERED');
                  return (isEmailMatch || isUidMatch || isPhoneMatch) && isCompleted;
                }).map(o => (
                  <div key={o.id} className="past-order-card-premium border-glow">
                    <div className="past-order-header-premium">
                      <span className="order-id-premium">Order ID: <strong>{o.id}</strong></span>
                      <span className="badge badge-success">Delivered</span>
                    </div>
                    <div className="past-order-body-premium">
                      <p className="order-items-summary-premium">
                        {o.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                      </p>
                      <div className="order-meta-info-premium">
                        <span>Paid: <strong>₹{o.totalAmount}</strong></span>
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="drawer-backdrop mobile-menu-backdrop fade-in" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-logo">
                <span className="brand-highlight">PIXI</span><span className="brand-light">go</span>
              </div>
              <button className="close-drawer-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="divider"></div>

            {/* Profile Summary in Menu */}
            <div className="mobile-menu-profile-summary">
              <div className="mobile-avatar-circle">
                <User size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="mobile-profile-info">
                <h4>{user ? user.name : 'Guest Customer'}</h4>
                <p>{user ? user.email : 'Log in to place orders'}</p>
              </div>
            </div>
            
            <div className="divider"></div>
 
            {/* Primary Customer Actions */}
            <div className="mobile-menu-links">
              <h3 className="menu-group-title">Menu Options</h3>
              
              <button 
                className="mobile-menu-link" 
                onClick={() => { setIsProfileOpen(true); setIsMobileMenuOpen(false); }}
              >
                <User size={18} className="text-neon" />
                <span>My Profile</span>
              </button>

              <button 
                className="mobile-menu-link" 
                onClick={() => {
                  const customerOrders = orders.filter(o => {
                    const emailVal = (o.customerEmail || o.email || '').trim().toLowerCase();
                    const targetEmail = customerEmail.trim().toLowerCase();
                    const isEmailMatch = emailVal === targetEmail;
                    const isUidMatch = user && o.userId && o.userId === user.uid;
                    const isPhoneMatch = o.customerPhone && o.customerPhone.trim() === customerPhone.trim();
                    return isEmailMatch || isUidMatch || isPhoneMatch;
                  });
                  const activeOrdersList = customerOrders.filter(o => !o.status || (o.status.toUpperCase() !== 'COMPLETED' && o.status.toUpperCase() !== 'DELIVERED'));
                  if (activeOrdersList.length > 0) {
                    setCurrentOrderTracking(activeOrdersList[0].id);
                    setIsTrackingDrawerOpen(true);
                  } else {
                    showToast("No active orders tracking at the moment!");
                  }
                  setIsMobileMenuOpen(false);
                }}
              >
                <Compass size={18} className="text-neon" />
                <span>My Orders</span>
              </button>

              <button 
                className="mobile-menu-link" 
                onClick={() => { 
                  setIsPastOrdersOpen(true); 
                  setIsMobileMenuOpen(false); 
                }}
              >
                <FileText size={18} className="text-neon" />
                <span>My Past Orders</span>
              </button>

              <button 
                className="mobile-menu-link" 
                onClick={() => { setIsCartDrawerOpen(true); setIsMobileMenuOpen(false); }}
              >
                <ShoppingCart size={18} className="text-neon" />
                <span>My Cart</span>
                {cart.length > 0 && (
                  <span className="cart-badge-count-mobile">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              <button 
                className="mobile-menu-link" 
                onClick={() => { setIsContactOpen(true); setIsMobileMenuOpen(false); }}
              >
                <Phone size={18} className="text-neon" />
                <span>Contact Us</span>
              </button>
            </div>

            <div className="divider" style={{ marginTop: 'auto' }}></div>

            {/* Actions (Logout / Log In) */}
            <div className="mobile-menu-actions">
              {user ? (
                <button 
                  className="mobile-menu-action-btn logout-action-btn" 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                >
                  <ArrowRight size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <button 
                  className="neon-btn mobile-menu-login-btn" 
                  onClick={() => { setIsSignUp(false); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tracking Drawer Overlay */}
      {isTrackingDrawerOpen && currentOrderTracking && (
        <div className="drawer-backdrop fade-in" onClick={() => setIsTrackingDrawerOpen(false)}>
          <div className="cart-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header-row">
              <h2 className="section-title"><Compass size={20} /> Order Tracking</h2>
              <button className="close-drawer-btn" onClick={() => setIsTrackingDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            {(() => {
              const trackedOrder = orders.find(o => o.id === currentOrderTracking);
              if (!trackedOrder) return <p className="text-muted">Order not found.</p>;

              return (
                <div className="tracked-order-detail-sidebar fade-in" style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>
                  {/* ETA banner */}
                  <div className="eta-banner-sidebar">
                    <span className="eta-countdown-sidebar">
                      {trackedOrder.status === 'COMPLETED' ? 'Delivered successfully!' : 
                       trackedOrder.status === 'ASSIGNED' ? 'Arriving in ~14 mins' :
                       trackedOrder.status === 'ACCEPTED' ? 'Preparing... ~22 mins' :
                       'Awaiting Confirmation'}
                    </span>
                  </div>

                  {/* Map */}
                  <div className="leaflet-mock-map-sidebar border-glow">
                    <LeafletMap 
                      riderCoords={trackedOrder.id === trackingOrderIdForHook ? liveRiderCoords : null}
                      merchantCoords={{ lat: 26.9015, lng: 75.7482 }}
                      customerCoords={parseCoords(trackedOrder.customerLocation)}
                      customerName={extractFriendlyAddress(trackedOrder.customerLocation)}
                      merchantName={trackedOrder.items[0]?.store || 'Merchant'}
                    />
                  </div>

                  {/* Details Grid */}
                  <div className="sidebar-details-grid">
                    <div className="sidebar-detail-row">
                      <span>Order ID:</span>
                      <strong>{trackedOrder.id}</strong>
                    </div>
                    <div className="sidebar-detail-row">
                      <span>Status:</span>
                      <span className={`badge ${trackedOrder.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                        {trackedOrder.status}
                      </span>
                    </div>
                    <div className="sidebar-detail-row">
                      <span>Payment Method:</span>
                      <span className="badge badge-info">{trackedOrder.paymentMethod}</span>
                    </div>
                    <div className="sidebar-detail-row">
                      <span>Total Amount:</span>
                      <strong>{formatINR(trackedOrder.totalAmount)}</strong>
                    </div>
                    <div className="sidebar-detail-row">
                      <span>Delivery Address:</span>
                      <span className="address-val" style={{ maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{trackedOrder.customerLocation}</span>
                    </div>
                  </div>

                  {/* Rider Information Panel */}
                  {trackedOrder.deliveryPartnerId ? (
                    <div className="rider-card-sidebar border-glow">
                      <div className="rider-avatar-sidebar">🛵</div>
                      <div className="rider-desc-sidebar">
                        <h4>{trackedOrder.deliveryPartnerName}</h4>
                        <p>Vehicle: {deliveryPartners.find(d => d.id === trackedOrder.deliveryPartnerId)?.vehicle.split(' (')[0] || '🛵'}</p>
                      </div>
                      <div className="otp-badge-sidebar">
                        <span>OTP: <strong>{trackedOrder.otp}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="rider-pending-sidebar">
                      <RefreshCw size={14} className="spin" />
                      <span>Assigning courier...</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {isContactOpen && (
        <div className="modal-backdrop fade-in" onClick={() => setIsContactOpen(false)}>
          <div className="contact-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsContactOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="contact-modal-header">
              <div className="contact-icon-glow">
                <MessageCircle size={36} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="section-title-premium">Contact Support Desk</h3>
              <p className="profile-sub">We are active 24/7 to assist you</p>
            </div>
            
            <div className="contact-methods-grid">
              <a 
                href="https://wa.me/919251054064" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-method-card border-glow"
              >
                <div className="contact-method-icon whatsapp-color">
                  <MessageCircle size={24} />
                </div>
                <div className="contact-method-details">
                  <h4>WhatsApp Chat</h4>
                  <p>+91 9251054064</p>
                </div>
                <ArrowRight size={16} className="contact-arrow" />
              </a>

              <a 
                href="mailto:pixigodelivery@gmail.com" 
                className="contact-method-card border-glow"
              >
                <div className="contact-method-icon email-color">
                  <Mail size={24} />
                </div>
                <div className="contact-method-details">
                  <h4>Email Support</h4>
                  <p>pixigodelivery@gmail.com</p>
                </div>
                <ArrowRight size={16} className="contact-arrow" />
              </a>

              <a 
                href="https://instagram.com/pixigo_" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-method-card border-glow"
              >
                <div className="contact-method-icon instagram-color">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </div>
                <div className="contact-method-details">
                  <h4>Instagram</h4>
                  <p>@pixigo_</p>
                </div>
                <ArrowRight size={16} className="contact-arrow" />
              </a>

              <a 
                href="https://facebook.com/pixigo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-method-card border-glow"
              >
                <div className="contact-method-icon facebook-color">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
                <div className="contact-method-details">
                  <h4>Facebook</h4>
                  <p>pixigo</p>
                </div>
                <ArrowRight size={16} className="contact-arrow" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rider Modal (Admin) */}
      {isEditRiderModalOpen && editingRider && (
        <div className="modal-backdrop fade-in" onClick={() => { setIsEditRiderModalOpen(false); setEditingRider(null); }}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setIsEditRiderModalOpen(false); setEditingRider(null); }}>
              <X size={20} />
            </button>
            
            <div className="profile-avatar-section">
              <div className="profile-avatar-glow" style={{ background: 'rgba(0, 255, 242, 0.1)' }}>
                <Bike size={40} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="section-title-premium">Edit Rider Credentials</h3>
              <p className="profile-sub">ID: {editingRider.id}</p>
            </div>
            
            <form onSubmit={handleSaveRiderEdit} className="profile-form-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group-premium">
                <label className="form-label-premium">Rider Name (Username)</label>
                <input 
                  type="text" 
                  value={editRiderName} 
                  onChange={(e) => setEditRiderName(e.target.value)} 
                  className="custom-input-premium"
                  required
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Email ID</label>
                <input 
                  type="email" 
                  value={editRiderEmail} 
                  onChange={(e) => setEditRiderEmail(e.target.value)} 
                  className="custom-input-premium"
                  required
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Old Password</label>
                <input 
                  type="text" 
                  value={editingRider.password} 
                  className="custom-input-premium"
                  disabled
                  readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">New Password</label>
                <input 
                  type="text" 
                  value={editRiderPassword} 
                  onChange={(e) => setEditRiderPassword(e.target.value)} 
                  className="custom-input-premium"
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Phone Number</label>
                <input 
                  type="text" 
                  value={editRiderPhone} 
                  onChange={(e) => setEditRiderPhone(e.target.value)} 
                  className="custom-input-premium"
                  required
                />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Vehicle Details</label>
                <input 
                  type="text" 
                  value={editRiderVehicle} 
                  onChange={(e) => setEditRiderVehicle(e.target.value)} 
                  className="custom-input-premium"
                  required
                />
              </div>
              <button type="submit" className="neon-btn save-profile-btn-premium" style={{ marginTop: '10px' }}>
                Save Rider Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product & Approve Modal (Admin) */}
      {isEditProductModalOpen && editingProduct && (
        <div className="modal-backdrop fade-in" onClick={() => { setIsEditProductModalOpen(false); setEditingProduct(null); }}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setIsEditProductModalOpen(false); setEditingProduct(null); }}>
              <X size={20} />
            </button>
            <div className="profile-avatar-section">
              <div className="profile-avatar-glow" style={{ background: 'rgba(0, 255, 242, 0.1)' }}>
                <Store size={40} style={{ color: 'rgba(0, 255, 242, 1)' }} />
              </div>
              <h3 className="section-title-premium" style={{ fontSize: '20px', fontWeight: 'bold' }}>Edit & Approve Product</h3>
              <p className="profile-sub" style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Shop: <strong>{editingProduct.store}</strong></p>
            </div>
            
            <form onSubmit={handleAdminEditAndApproveProduct} className="profile-edit-form" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group-premium" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label className="form-label-premium" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Product Name</label>
                <input 
                  type="text" 
                  value={editProductName} 
                  onChange={(e) => setEditProductName(e.target.value)} 
                  className="custom-input-premium"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                />
              </div>
              <div className="form-group-premium" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label className="form-label-premium" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editProductPrice} 
                  onChange={(e) => setEditProductPrice(e.target.value)} 
                  className="custom-input-premium"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                />
              </div>
              <div className="form-group-premium" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label className="form-label-premium" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Category</label>
                <select 
                  value={editProductCategory} 
                  onChange={(e) => setEditProductCategory(e.target.value)} 
                  className="custom-input-premium"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="neon-btn save-profile-btn-premium" style={{ marginTop: '10px', padding: '12px', width: '100%' }}>
                Save & Approve Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Shop Details Modal (Admin) */}
      {isShopModalOpen && selectedShopDetails && (
        <div className="modal-backdrop fade-in" onClick={() => { setIsShopModalOpen(false); setSelectedShopDetails(null); }}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setIsShopModalOpen(false); setSelectedShopDetails(null); }}>
              <X size={20} />
            </button>
            
            <div className="profile-avatar-section" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className="profile-avatar-glow" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Store size={40} style={{ color: 'rgba(245, 158, 11, 1)' }} />
              </div>
              <h3 className="section-title-premium">{selectedShopDetails.name}</h3>
              <p className="profile-sub" style={{ marginTop: '4px' }}>Shop ID: <strong>{selectedShopDetails.id}</strong></p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', color: 'var(--color-text-main)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Category:</span>
                <strong>{selectedShopDetails.category}</strong>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Phone:</span>
                <strong>{selectedShopDetails.phone || '9251054064'}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Address:</span>
                <span>{selectedShopDetails.address || 'Vaishali Market, Jaipur (RJ)'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Documents Status:</span>
                <span className={`badge ${selectedShopDetails.docs === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedShopDetails.docs || 'Pending Approval'}
                </span>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Onboarding Documents Provided:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={shopDocAadhaar} 
                      onChange={(e) => setShopDocAadhaar(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Aadhaar Card
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={shopDocPan} 
                      onChange={(e) => setShopDocPan(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    PAN Card
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={shopDocFssai} 
                      onChange={(e) => setShopDocFssai(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    FSSAI license
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Verification Status:</span>
                <span className={`badge ${selectedShopDetails.verified ? 'badge-success' : 'badge-danger'}`}>
                  {selectedShopDetails.verified ? 'Verified & Active' : 'Unverified / Blocked'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
              <button 
                className="neon-btn" 
                onClick={handleAdminSaveShopDocs}
                style={{ width: '100%', padding: '10px', fontWeight: 'bold' }}
              >
                Save Documents
              </button>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button 
                  className="secondary-btn" 
                  onClick={() => {
                    const sPhone = selectedShopDetails.phone || '9251054064';
                    window.open(`https://wa.me/${sPhone}?text=Hi%20${selectedShopDetails.name},%20we%20have%20reviewed%20your%20PixiGo%20merchant%20account.%20Please%20verify%20details.`, '_blank');
                  }}
                  style={{ flex: 1, padding: '10px' }}
                >
                  Contact Merchant
                </button>
                <button 
                  className="secondary-btn" 
                  onClick={() => { setIsShopModalOpen(false); setSelectedShopDetails(null); }}
                  style={{ width: '80px', padding: '10px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification fade-in">
          <Check size={18} style={{ strokeWidth: 3, color: 'var(--color-primary)' }} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
