import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, User, Shield, Compass, Bike, Store, Trash2, Package,
  FileText, Check, X, ArrowRight, Download, Search, Tag, 
  MessageCircle, AlertCircle, Plus, MapPin, DollarSign, Activity, Eye, EyeOff, Phone, RefreshCw, Menu,
  Mail, Settings, ChevronDown, Users
} from 'lucide-react';
import './App.css';
import { auth, db, rtdb, googleProvider, firebaseConfig } from './firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, onSnapshot, orderBy, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, remove as rtdbRemove } from 'firebase/database';
import { getDistance, calculateDeliveryRates, fetchRoadDistance } from './distanceUtils';

// Initial Mock Data with Premium Image URLs & Emoji Fallbacks
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Fresh Kirana Atta (5kg)', price: 280, category: 'General Store', store: 'Pooja Kirana Store', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=60', emoji: '🌾', isVeg: true },
  { id: 'p2', name: 'Organic Mustard Oil (1L)', price: 175, category: 'General Store', store: 'Pooja Kirana Store', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60', emoji: '🛢️', isVeg: true },
  { id: 'p3', name: 'Fresh Farm Tomatoes (1kg)', price: 40, category: 'Vegetable', store: 'Green Farms Veggies', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=300&auto=format&fit=crop&q=60', emoji: '🍅', isVeg: true },
  { id: 'p4', name: 'Alphonso Mangoes (1kg)', price: 250, category: 'Vegetable', store: 'Green Farms Veggies', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&auto=format&fit=crop&q=60', emoji: '🥭', isVeg: true },
  { id: 'p5', name: 'Creamy Paneer (200g)', price: 90, category: 'Dairy', store: 'Krishna Dairy', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop&q=60', emoji: '🥛', isVeg: true },
  { id: 'p6', name: 'Amul Salted Butter (100g)', price: 56, category: 'Dairy', store: 'Krishna Dairy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=60', emoji: '🧈', isVeg: true },
  { id: 'p7', name: 'Chocolate Fudge Cake', price: 650, category: 'Bakery', store: 'Bake House', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=60', emoji: '🎂', isVeg: true },
  { id: 'p8', name: 'Garlic Bread Sticks', price: 120, category: 'Bakery', store: 'Bake House', image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=300&auto=format&fit=crop&q=60', emoji: '🥖', isVeg: true },
  { id: 'p9', name: 'Crispy Veg Burger', price: 140, category: 'Fast Food', store: 'Burger Club', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60', emoji: '🍔', isVeg: true },
  { id: 'p10', name: 'Cheese Pizza (Medium)', price: 320, category: 'Fast Food', store: 'Pizza Corner', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60', emoji: '🍕', isVeg: true },
  { id: 'p11', name: 'Butter Chicken with Butter Naan', price: 380, category: 'Restaurant Cafe', store: 'Grand Plaza Restaurant', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&auto=format&fit=crop&q=60', emoji: '🍛', isVeg: false },
  { id: 'p12', name: 'Belgian Chocolate Waffle', price: 190, category: 'Restaurant Cafe', store: 'Sweet Treat Cafe', image: 'https://images.unsplash.com/photo-1562376502-6f769499887d?w=300&auto=format&fit=crop&q=60', emoji: '🧇', isVeg: true },
  { id: 'p13', name: 'Double Chocolate Ice Cream', price: 150, category: 'Icecream and dessert', store: 'Gelato Heaven', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&auto=format&fit=crop&q=60', emoji: '🍨', isVeg: true },
  { id: 'p14', name: 'Premium Multi-vitamins (60 Caps)', price: 890, category: 'Medical and fitness', store: 'Apollo Wellness', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60', emoji: '💊', isVeg: true },
  { id: 'p15', name: 'Fresh Orange Juice (500ml)', price: 110, category: 'Juice and drink', store: 'Juice Junction', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop&q=60', emoji: '🍹', isVeg: true },
  { id: 'p16', name: 'Masala Chai Mix (250g)', price: 180, category: 'Snacks and breakfast', store: 'Tea Valley', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=60', emoji: '☕', isVeg: true }
];

const INITIAL_SHOPS = [
  { id: 'merch_bake_house', storeName: 'Bake House', name: 'Bake House', category: 'Bakery', phone: '9251054064', address: 'Collectorate Road, Chittorgarh', verified: true, docs: 'Approved', openTime: '08:00', closeTime: '23:00', lat: 24.8887, lng: 74.6269 },
  { id: 'merch_pooja_kirana', storeName: 'Pooja Kirana Store', name: 'Pooja Kirana Store', category: 'General Store', phone: '9251054064', address: 'Bojunda, Chittorgarh', verified: true, docs: 'Approved', openTime: '07:00', closeTime: '22:00', lat: 24.8887, lng: 74.6269 },
  { id: 'merch_krishna_dairy', storeName: 'Krishna Dairy', name: 'Krishna Dairy', category: 'Dairy', phone: '9251054064', address: 'Police Line, Chittorgarh', verified: true, docs: 'Approved', openTime: '06:00', closeTime: '21:00', lat: 24.8887, lng: 74.6269 },
  { id: 'merch_grand_plaza', storeName: 'Grand Plaza Restaurant', name: 'Grand Plaza Restaurant', category: 'Restaurant Cafe', phone: '9251054064', address: 'Birla Hospital Road, Chittorgarh', verified: true, docs: 'Approved', openTime: '11:00', closeTime: '23:30', lat: 24.8887, lng: 74.6269 },
  { id: 'merch_green_farms', storeName: 'Green Farms Veggies', name: 'Green Farms Veggies', category: 'Vegetable', phone: '9251054064', address: 'Pauta Chowk, Chittorgarh', verified: true, docs: 'Approved', openTime: '08:00', closeTime: '20:00', lat: 24.8887, lng: 74.6269 }
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

const getShopOpenStatus = (shop) => {
  if (!shop) return { isOpen: false, reason: 'Unknown Store' };
  
  // 1. Check manual toggle status (defaults to true if undefined)
  if (shop.isAcceptingOrders === false) {
    return { isOpen: false, reason: 'MANUAL_CLOSED' };
  }
  
  // 2. Check automatic operating hours scheduler
  const openTime = shop.openTime || "09:00";
  const closeTime = shop.closeTime || "22:00";
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const openTotalMinutes = openH * 60 + openM;
  const closeTotalMinutes = closeH * 60 + closeM;
  
  const isWithinHours = currentTotalMinutes >= openTotalMinutes && currentTotalMinutes <= closeTotalMinutes;
  
  if (!isWithinHours) {
    return { isOpen: false, reason: 'OUTSIDE_HOURS', details: `Operating Hours: ${openTime} - ${closeTime}` };
  }
  
  return { isOpen: true, reason: 'OPEN' };
};

const MAX_DELIVERY_RADIUS_KM = 10.0;

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
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [isDistanceLoading, setIsDistanceLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('ONLINE');
  const [currentOrderTracking, setCurrentOrderTracking] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [reroutingOrderId, setReroutingOrderId] = useState(null);
  const [rerouteSelectedShop, setRerouteSelectedShop] = useState('');
  const [rerouteSelectedRider, setRerouteSelectedRider] = useState('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart | payment
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTrackingDrawerOpen, setIsTrackingDrawerOpen] = useState(false);
  const [activeQrModalOrder, setActiveQrModalOrder] = useState(null);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [adminSubView, setAdminSubView] = useState('sales'); // sales | orders | shops | riders
  const [allAdmins, setAllAdmins] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
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
  const [vegFilter, setVegFilter] = useState('All'); // 'All' | 'Veg' | 'NonVeg'
  const [newProductIsVeg, setNewProductIsVeg] = useState(true);

  // Admin catalog additions state variables
  const [adminNewProductName, setAdminNewProductName] = useState('');
  const [adminNewProductPrice, setAdminNewProductPrice] = useState('');
  const [adminNewProductOrigPrice, setAdminNewProductOrigPrice] = useState('');
  const [adminNewProductOffer, setAdminNewProductOffer] = useState('');
  const [adminNewProductImage, setAdminNewProductImage] = useState('');
  const [adminNewProductCategory, setAdminNewProductCategory] = useState('Bakery');
  const [adminNewProductStore, setAdminNewProductStore] = useState('');
  const [adminNewProductIsVeg, setAdminNewProductIsVeg] = useState(true);
  const [adminCustomCategory, setAdminCustomCategory] = useState('');
  const [adminCustomStore, setAdminCustomStore] = useState('');
  const [isAdminAddFormOpen, setIsAdminAddFormOpen] = useState(false);
  const [isSalesUnlocked, setIsSalesUnlocked] = useState(() => sessionStorage.getItem('pixigo_sales_unlocked') === 'true');
  const [salesPinInput, setSalesPinInput] = useState('');
  const [salesPinError, setSalesPinError] = useState('');
  const [showSalesPin, setShowSalesPin] = useState(false);
  const [selectedAnalyticsMerchant, setSelectedAnalyticsMerchant] = useState(null);
  const [selectedAnalyticsRider, setSelectedAnalyticsRider] = useState(null);
  const [selectedAnalyticsSalesGroup, setSelectedAnalyticsSalesGroup] = useState(null);
  const [salesTab, setSalesTab] = useState('merchants'); // merchants | riders

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
  const [riderAnnouncement, setRiderAnnouncement] = useState('Welcome to PIXIgo Rider Portal! Drive safely and always verify order OTP before completing delivery.');
  const [riderAnnouncementEdit, setRiderAnnouncementEdit] = useState('Welcome to PIXIgo Rider Portal! Drive safely and always verify order OTP before completing delivery.');
  const [customerAnnouncement, setCustomerAnnouncement] = useState('🎉 Special Offer: Use code FIRST20 to get flat 20% discount on your first order! | Free delivery on orders above ₹500! | Quickest delivery in town!');
  const [customerAnnouncementEdit, setCustomerAnnouncementEdit] = useState('🎉 Special Offer: Use code FIRST20 to get flat 20% discount on your first order! | Free delivery on orders above ₹500! | Quickest delivery in town!');
  const [tempAuthPassword, setTempAuthPassword] = useState('');
  const [tempAuthEmail, setTempAuthEmail] = useState('');

  const [onboardShopName, setOnboardShopName] = useState('');
  const [onboardShopCategory, setOnboardShopCategory] = useState('General Store');
  const [onboardShopPhone, setOnboardShopPhone] = useState('');
  const [onboardShopEmail, setOnboardShopEmail] = useState('');
  const [onboardShopAddress, setOnboardShopAddress] = useState('');

  const [onboardRiderName, setOnboardRiderName] = useState('');
  const [onboardRiderEmail, setOnboardRiderEmail] = useState('');
  const [onboardRiderPhone, setOnboardRiderPhone] = useState('');
  const [onboardRiderVehicle, setOnboardRiderVehicle] = useState('');

  const [shopDocAadhaar, setShopDocAadhaar] = useState(false);
  const [shopDocPan, setShopDocPan] = useState(false);
  const [shopDocFssai, setShopDocFssai] = useState(false);
  const [shopDocLat, setShopDocLat] = useState('');
  const [shopDocLng, setShopDocLng] = useState('');

  // --- HELPER FUNCTIONS ---
  const getAnalytics = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      return new Date(o.createdAt) >= todayStart;
    });

    const todayStats = {
      grossSales: todayOrders.filter(o => !o.status?.startsWith('CANCELLED')).reduce((acc, o) => acc + (o.totalAmount || 0), 0),
      placedCount: todayOrders.length,
      completedCount: todayOrders.filter(o => o.status === 'COMPLETED').length,
      cancelledCount: todayOrders.filter(o => o.status?.startsWith('CANCELLED')).length,
    };

    const allTimeStats = {
      grossSales: orders.filter(o => !o.status?.startsWith('CANCELLED')).reduce((acc, o) => acc + (o.totalAmount || 0), 0),
      placedCount: orders.length,
      completedCount: orders.filter(o => o.status === 'COMPLETED').length,
      cancelledCount: orders.filter(o => o.status?.startsWith('CANCELLED')).length,
    };

    // Aggregated Merchant Stats
    const merchantStatsMap = {};
    // Initialize with all existing shops
    shops.forEach(s => {
      const sName = s.storeName || s.name;
      if (sName) {
        merchantStatsMap[sName] = {
          id: s.id,
          name: sName,
          category: s.category || 'N/A',
          phone: s.phone || 'N/A',
          completedCount: 0,
          activeCount: 0,
          cancelledCount: 0,
          grossSales: 0,
          netEarnings: 0
        };
      }
    });

    // Aggregate from orders
    orders.forEach(o => {
      const mName = o.merchantName || o.storeName || (o.items && o.items[0]?.store);
      if (!mName) return;

      if (!merchantStatsMap[mName]) {
        merchantStatsMap[mName] = {
          id: o.merchantId || `merch_unknown`,
          name: mName,
          category: (o.items && o.items[0]?.category) || 'N/A',
          phone: 'N/A',
          completedCount: 0,
          activeCount: 0,
          cancelledCount: 0,
          grossSales: 0,
          netEarnings: 0
        };
      }

      const isCancelled = o.status?.startsWith('CANCELLED');
      if (o.status === 'COMPLETED') {
        merchantStatsMap[mName].completedCount += 1;
      } else if (isCancelled) {
        merchantStatsMap[mName].cancelledCount += 1;
      } else {
        merchantStatsMap[mName].activeCount += 1;
      }

      if (!isCancelled) {
        merchantStatsMap[mName].grossSales += (o.totalAmount || 0);
        merchantStatsMap[mName].netEarnings += (o.netMerchantEarning || 0);
      }
    });

    // Aggregated Rider Stats
    const riderStatsMap = {};
    // Initialize with all existing delivery partners
    deliveryPartners.forEach(r => {
      if (r.id) {
        riderStatsMap[r.id] = {
          id: r.id,
          name: r.name || 'Rider',
          vehicle: r.vehicle || 'N/A',
          phone: r.phone || 'N/A',
          completedCount: 0,
          totalPayout: 0
        };
      }
    });

    // Aggregate from orders
    orders.forEach(o => {
      const rId = o.deliveryPartnerId;
      if (!rId) return;

      const rName = o.deliveryPartnerName || 'Rider';
      if (!riderStatsMap[rId]) {
        riderStatsMap[rId] = {
          id: rId,
          name: rName,
          vehicle: 'N/A',
          phone: 'N/A',
          completedCount: 0,
          totalPayout: 0
        };
      }

      if (o.status === 'COMPLETED') {
        riderStatsMap[rId].completedCount += 1;
        riderStatsMap[rId].totalPayout += (o.riderPayout || 0);
      }
    });

    return {
      todayStats,
      allTimeStats,
      merchantStats: Object.values(merchantStatsMap),
      riderStats: Object.values(riderStatsMap)
    };
  };

  const handleUnlockSales = (e) => {
    e.preventDefault();
    if (salesPinInput.trim() === '9251' || salesPinInput.trim() === 'admin123') {
      setIsSalesUnlocked(true);
      sessionStorage.setItem('pixigo_sales_unlocked', 'true');
      setSalesPinError('');
      setSalesPinInput('');
    } else {
      setSalesPinError('Invalid Admin PIN. Please try again.');
    }
  };

  const showToast = (message, type = 'info') => {
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    setToast({ show: true, message, type });
    const id = setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
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

  // Fetch actual road distance dynamically when customer coordinates or cart items change
  useEffect(() => {
    let active = true;
    const calculateDistance = async () => {
      const storeName = cart[0]?.store || '';
      const cartShop = shops.find(s => s.name === storeName || s.storeName === storeName);
      const customerCoords = parseCoords(customerAddress);
      
      if (cartShop && customerCoords) {
        setIsDistanceLoading(true);
        const shopLat = cartShop.lat || 24.8887;
        const shopLng = cartShop.lng || 74.6269;
        
        try {
          const dist = await fetchRoadDistance(shopLat, shopLng, customerCoords.lat, customerCoords.lng);
          if (active) {
            setDeliveryDistance(dist);
          }
        } catch (error) {
          console.error("Error fetching dynamic road distance:", error);
          if (active) {
            setDeliveryDistance(1.0); // Safe fallback
          }
        } finally {
          if (active) {
            setIsDistanceLoading(false);
          }
        }
      } else {
        if (active) {
          setDeliveryDistance(null);
          setIsDistanceLoading(false);
        }
      }
    };

    calculateDistance();

    return () => {
      active = false;
    };
  }, [customerAddress, cart, shops]);

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
        let localEmail = currentUser.email; // ALWAYS use the authenticated email as primary source of truth
        let localAddress = localStorage.getItem('pixigo_customerAddress') || '';

        try {
          const timestamp = new Date().toISOString();
          const currentTab = window.location.pathname.replace('/', '').toLowerCase();

          const emailClean = localEmail.trim().toLowerCase();
          const existingRole = getRoleForEmail(emailClean);

          // 1. Sync with Customer collection only if they are not signing up/logging in as admin
          // and they are not already an admin, rider, or merchant
          if (currentTab !== 'admin' && (existingRole === 'customer' || !existingRole)) {
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
              localStorage.setItem('pixigo_customerName', localName);
              localStorage.setItem('pixigo_customerPhone', localPhone);
              localStorage.setItem('pixigo_customerEmail', localEmail);
              localStorage.setItem('pixigo_customerAddress', localAddress);
            }
          }

          // 2. Sync with Admin collection if on admin page AND not already another role
          if (currentTab === 'admin') {
            if (existingRole === 'admin' || !existingRole) {
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
            } else {
              console.warn("User already has another role: cannot sync as Admin", existingRole);
            }
          }


          const adminDocRef = doc(db, "admins", currentUser.uid);
          const adminSnap = await getDoc(adminDocRef);
          if (adminSnap.exists()) {
            setUserRole('admin');
          } else {
            const ridersRef = collection(db, "delivery_boys");
            const riderQuery1 = query(ridersRef, where("authUid", "==", currentUser.uid));
            const riderQuery2 = query(ridersRef, where("email", "==", currentUser.email));
            const [riderSnap1, riderSnap2] = await Promise.all([getDocs(riderQuery1), getDocs(riderQuery2)]);
            
            let riderDoc = null;
            if (!riderSnap1.empty) riderDoc = riderSnap1.docs[0];
            else if (!riderSnap2.empty) riderDoc = riderSnap2.docs[0];

            if (riderDoc) {
              setUserRole('rider');
              const riderData = riderDoc.data();
              setUser({
                uid: riderData.id || riderDoc.id,
                email: currentUser.email,
                name: riderData.name || nameVal
              });
            } else {
              const merchantsRef = collection(db, "merchants");
              const merchQuery1 = query(merchantsRef, where("authUid", "==", currentUser.uid));
              const merchQuery2 = query(merchantsRef, where("email", "==", currentUser.email));
              const [merchSnap1, merchSnap2] = await Promise.all([getDocs(merchQuery1), getDocs(merchQuery2)]);
              
              let merchDoc = null;
              if (!merchSnap1.empty) merchDoc = merchSnap1.docs[0];
              else if (!merchSnap2.empty) merchDoc = merchSnap2.docs[0];

              if (merchDoc) {
                setUserRole('merchant');
                const merchData = merchDoc.data();
                setUser({
                  uid: merchData.id || merchDoc.id,
                  email: currentUser.email,
                  name: merchData.storeName || nameVal
                });
              } else {
                setUserRole('customer');
              }
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
        
        // Reset customer states on logout
        localStorage.removeItem('pixigo_customerName');
        localStorage.removeItem('pixigo_customerPhone');
        localStorage.removeItem('pixigo_customerEmail');
        localStorage.removeItem('pixigo_customerAddress');
        setCustomerName('Raj Malhotra');
        setCustomerPhone('9251054064');
        setCustomerEmail('pixigodelivery@gmail.com');
        setCustomerAddress('Vaishali Nagar, Jaipur (RJ)');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time orders from Firestore
  useEffect(() => {
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
      // Merge fetched shops with initial mock shops to retain missing fields (like openTime, closeTime, lat, lng)
      const mergedShops = fetchedShops.map(fs => {
        const mockShop = INITIAL_SHOPS.find(ms => ms.id === fs.id);
        if (mockShop) {
          return {
            ...mockShop,
            ...fs // Firestore data overrides mock data
          };
        }
        return fs;
      });
      
      // Also add any mock shops that aren't in Firestore at all
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

  // Fetch real-time Rider Announcement from Firestore
  useEffect(() => {
    const announceDocRef = doc(db, "configs", "rider_announcement");
    const unsubscribe = onSnapshot(announceDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRiderAnnouncement(data.text || 'Welcome to PIXIgo Rider Portal! Drive safely and always verify order OTP before completing delivery.');
        setRiderAnnouncementEdit(data.text || 'Welcome to PIXIgo Rider Portal! Drive safely and always verify order OTP before completing delivery.');
      } else {
        setRiderAnnouncement('Welcome to PIXIgo Rider Portal! Drive safely and always verify order OTP before completing delivery.');
        setRiderAnnouncementEdit('Welcome to PIXIgo Rider Portal! Drive safely and always verify order OTP before completing delivery.');
      }
    }, (error) => {
      console.error("Firestore rider announcement subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time Customer Announcement from Firestore
  useEffect(() => {
    const announceDocRef = doc(db, "configs", "customer_announcement");
    const unsubscribe = onSnapshot(announceDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCustomerAnnouncement(data.text || '🎉 Special Offer: Use code FIRST20 to get flat 20% discount on your first order! | Free delivery on orders above ₹500! | Quickest delivery in town!');
        setCustomerAnnouncementEdit(data.text || '🎉 Special Offer: Use code FIRST20 to get flat 20% discount on your first order! | Free delivery on orders above ₹500! | Quickest delivery in town!');
      } else {
        setCustomerAnnouncement('🎉 Special Offer: Use code FIRST20 to get flat 20% discount on your first order! | Free delivery on orders above ₹500! | Quickest delivery in town!');
        setCustomerAnnouncementEdit('🎉 Special Offer: Use code FIRST20 to get flat 20% discount on your first order! | Free delivery on orders above ₹500! | Quickest delivery in town!');
      }
    }, (error) => {
      console.error("Firestore customer announcement subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time admins from Firestore
  useEffect(() => {
    const adminsRef = collection(db, "admins");
    const unsubscribe = onSnapshot(adminsRef, (snapshot) => {
      const fetchedAdmins = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAdmins.push({
          firestoreId: doc.id,
          id: data.id || doc.id,
          name: data.name || 'Admin',
          email: data.email || '',
          role: 'admin',
          ...data
        });
      });
      setAllAdmins(fetchedAdmins);
    }, (error) => {
      console.warn("Firestore admins subscription error (rules might restrict):", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time customers from Firestore
  useEffect(() => {
    const customersRef = collection(db, "customers");
    const unsubscribe = onSnapshot(customersRef, (snapshot) => {
      const fetchedCustomers = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedCustomers.push({
          firestoreId: doc.id,
          id: data.id || doc.id,
          name: data.name || 'Customer',
          email: data.email || '',
          role: 'customer',
          ...data
        });
      });
      setAllCustomers(fetchedCustomers);
    }, (error) => {
      console.warn("Firestore customers subscription error (rules might restrict):", error);
    });
    return () => unsubscribe();
  }, []);

  // Watch for tracked order cancellation and notify user / close panel
  useEffect(() => {
    if (currentOrderTracking) {
      const trackedOrder = orders.find(o => o.id === currentOrderTracking);
      if (trackedOrder) {
        const statusUpper = trackedOrder.status?.toUpperCase() || '';
        if (statusUpper.startsWith('CANCELLED')) {
          let msg = `Your order ${trackedOrder.id} has been cancelled.`;
          if (statusUpper === 'CANCELLED_BY_STORE') {
            msg = `Your order ${trackedOrder.id} has been Cancelled by the Store.`;
          } else if (statusUpper === 'CANCELLED_BY_RIDER') {
            msg = `Your order ${trackedOrder.id} has been Cancelled by the Rider.`;
          } else if (statusUpper === 'CANCELLED_BY_ADMIN') {
            msg = `Your order ${trackedOrder.id} has been Cancelled by Admin.`;
          }
          
          setCurrentOrderTracking(null);
          setIsTrackingDrawerOpen(false);
          alert(msg);
        }
      }
    }
  }, [orders, currentOrderTracking]);

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

  const play30SecondBeepAlert = () => {
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

      const startBeeps = () => {
        for (let i = 0; i < 30; i++) {
          playBeep(987.77, 0.25, i * 1.0);
        }
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          startBeeps();
        });
      } else {
        startBeeps();
      }
    } catch (e) {
      console.warn("30-second beep alert failed:", e);
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
  const riderActiveJobs = user ? orders.filter(o => o.deliveryPartnerId === user.uid && o.status !== 'COMPLETED' && !o.status?.startsWith('CANCELLED')) : [];

  useEffect(() => {
    if (riderActiveJobs.length > prevActiveJobsCount.current) {
      if (prevActiveJobsCount.current > 0 || (activeTab === 'delivery' && riderActiveJobs.length > 0)) {
        playNotificationSound();
        showToast("🔔 New delivery run assigned! Check details below.");
      }
    }
    prevActiveJobsCount.current = riderActiveJobs.length;
  }, [riderActiveJobs.length, activeTab]);

  const prevPoolJobsCount = useRef(0);
  const availablePoolJobs = orders.filter(o => o.status === 'ACCEPTED' && !o.deliveryPartnerId);

  useEffect(() => {
    if (activeTab === 'delivery') {
      if (availablePoolJobs.length > prevPoolJobsCount.current) {
        play30SecondBeepAlert();
        showToast("🔔 New delivery run available in the pool! Check details below.");
      }
    }
    prevPoolJobsCount.current = availablePoolJobs.length;
  }, [availablePoolJobs.length, activeTab]);

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
          play30SecondBeepAlert();
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

  const getRoleForEmail = (email) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (allAdmins.some(a => (a.email || '').trim().toLowerCase() === cleanEmail)) {
      return 'admin';
    }
    if (shops.some(s => (s.email || '').trim().toLowerCase() === cleanEmail)) {
      return 'merchant';
    }
    if (deliveryPartners.some(d => (d.email || '').trim().toLowerCase() === cleanEmail)) {
      return 'rider';
    }
    if (allCustomers.some(c => (c.email || '').trim().toLowerCase() === cleanEmail)) {
      return 'customer';
    }
    return null;
  };

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
        const cleanRiderEmail = riderEmailInput.trim().toLowerCase();
        const existingRole = getRoleForEmail(cleanRiderEmail);
        if (existingRole) {
          setAuthError(`This email address is already registered as a ${existingRole}. An email can only have one role.`);
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
      const emailClean = targetEmail.trim().toLowerCase();
      const existingRole = getRoleForEmail(emailClean);
      if (existingRole) {
        setAuthError(`This email address is already registered as a ${existingRole}. An email can only have one role.`);
        return;
      }
      createUserWithEmailAndPassword(auth, targetEmail, authPassword)
        .then(async (userCredential) => {
          const uid = userCredential.user.uid;
          const email = targetEmail;
          const name = email.split('@')[0];
          const timestamp = new Date().toISOString();
          const currentTab = window.location.pathname.replace('/', '').toLowerCase();

          try {
            // 1. Initialize customer document in Firestore
            if (currentTab !== 'admin') {
              const customerDocRef = doc(db, "customers", uid);
              await setDoc(customerDocRef, {
                name: name,
                email: email,
                phone: '',
                address: '',
                createdAt: timestamp
              });
            }

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
    sessionStorage.removeItem('pixigo_sales_unlocked');
    setIsSalesUnlocked(false);
    setSelectedAnalyticsMerchant(null);
    setSelectedAnalyticsRider(null);
    setSelectedAnalyticsSalesGroup(null);
    setSalesTab('merchants');
    localStorage.removeItem('pixigo_rider_session');
    localStorage.removeItem('pixigo_customerName');
    localStorage.removeItem('pixigo_customerPhone');
    localStorage.removeItem('pixigo_customerEmail');
    localStorage.removeItem('pixigo_customerAddress');
    setCustomerName('Raj Malhotra');
    setCustomerPhone('9251054064');
    setCustomerEmail('pixigodelivery@gmail.com');
    setCustomerAddress('Vaishali Nagar, Jaipur (RJ)');
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

  // Active Category list derived from standard categories + custom product categories
  const standardCategories = [
    'All', 'General Store', 'Vegetable', 'Dairy', 'Bakery', 'Fast Food', 
    'Restaurant Cafe', 'Icecream and dessert', 'Medical and fitness', 
    'Juice and drink', 'Snacks and breakfast'
  ];
  const dynamicCategories = [...new Set(products.filter(p => p.approved !== false).map(p => p.category))].filter(Boolean);
  const categories = ['All', ...new Set([
    ...standardCategories.slice(1),
    ...dynamicCategories
  ])];

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
      const riderPayout = o.status === 'COMPLETED' ? (o.riderPayout !== undefined ? o.riderPayout : o.deliveryCharge) : 0;
      return acc + (o.commissionAmount - riderPayout);
    }, 0)
  };

  // Compile all users list
  const compiledAllUsers = [];
  const userIdsSeen = new Set();

  // 1. Add Admins
  allAdmins.forEach(u => {
    if (u.id && !userIdsSeen.has(u.id)) {
      userIdsSeen.add(u.id);
      compiledAllUsers.push({
        id: u.id,
        name: u.name,
        email: u.email || 'N/A',
        role: 'admin'
      });
    }
  });

  // 2. Add Merchants
  shops.forEach(u => {
    if (u.id && !userIdsSeen.has(u.id)) {
      userIdsSeen.add(u.id);
      compiledAllUsers.push({
        id: u.id,
        name: u.name || u.storeName,
        email: u.email || 'N/A',
        role: 'merchant'
      });
    }
  });

  // 3. Add Riders
  deliveryPartners.forEach(u => {
    if (u.id && !userIdsSeen.has(u.id)) {
      userIdsSeen.add(u.id);
      compiledAllUsers.push({
        id: u.id,
        name: u.name,
        email: u.email || 'N/A',
        role: 'rider'
      });
    }
  });

  // 4. Add Customers
  allCustomers.forEach(u => {
    if (u.id && !userIdsSeen.has(u.id)) {
      userIdsSeen.add(u.id);
      compiledAllUsers.push({
        id: u.id,
        name: u.name,
        email: u.email || 'N/A',
        role: 'customer'
      });
    }
  });

  // Admin search filtering logic
  const filteredOrders = orders.filter(o => o.status !== 'COMPLETED').filter(o => {
    if (!adminSearchQuery) return true;
    const queryLower = adminSearchQuery.toLowerCase();
    return (
      (o.id && o.id.toLowerCase().includes(queryLower)) ||
      (o.customerName && o.customerName.toLowerCase().includes(queryLower)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(queryLower)) ||
      (o.items && o.items[0]?.store && o.items[0].store.toLowerCase().includes(queryLower)) ||
      (o.merchantName && o.merchantName.toLowerCase().includes(queryLower)) ||
      (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(queryLower))
    );
  });

  const filteredShops = shops.filter(s => {
    if (!adminSearchQuery) return true;
    const queryLower = adminSearchQuery.toLowerCase();
    return (
      (s.id && s.id.toLowerCase().includes(queryLower)) ||
      (s.name && s.name.toLowerCase().includes(queryLower)) ||
      (s.category && s.category.toLowerCase().includes(queryLower)) ||
      (s.phone && s.phone.toLowerCase().includes(queryLower))
    );
  });

  const filteredRiders = deliveryPartners.filter(d => {
    if (!adminSearchQuery) return true;
    const queryLower = adminSearchQuery.toLowerCase();
    return (
      (d.id && d.id.toLowerCase().includes(queryLower)) ||
      (d.name && d.name.toLowerCase().includes(queryLower)) ||
      (d.phone && d.phone.toLowerCase().includes(queryLower)) ||
      (d.vehicle && d.vehicle.toLowerCase().includes(queryLower))
    );
  });

  const filteredAdminProducts = products.filter(p => {
    if (!adminSearchQuery) return true;
    const queryLower = adminSearchQuery.toLowerCase();
    return (
      (p.id && p.id.toLowerCase().includes(queryLower)) ||
      (p.name && p.name.toLowerCase().includes(queryLower)) ||
      (p.store && p.store.toLowerCase().includes(queryLower)) ||
      (p.category && p.category.toLowerCase().includes(queryLower))
    );
  });

  const filteredUsers = compiledAllUsers.filter(u => {
    if (!adminSearchQuery) return true;
    const queryLower = adminSearchQuery.toLowerCase();
    return (
      (u.id && u.id.toLowerCase().includes(queryLower)) ||
      (u.name && u.name.toLowerCase().includes(queryLower)) ||
      (u.email && u.email.toLowerCase().includes(queryLower)) ||
      (u.role && u.role.toLowerCase().includes(queryLower))
    );
  });

  // Helper: Format price in INR
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // Helper: Get final price of product
  const getProductFinalPrice = (p) => {
    return p.price;
  };

  // Admin: Update product catalog details
  const handleAdminUpdateProductCatalog = async (productId, newPrice, newOriginalPrice, newOfferText, newImage) => {
    const price = parseFloat(newPrice);
    const originalPrice = parseFloat(newOriginalPrice) || 0;
    
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price!");
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const updatedFields = {
      price: price,
      originalPrice: originalPrice,
      offerText: newOfferText,
      image: newImage || prod.image || ''
    };

    if (prod.firestoreId) {
      try {
        const prodRef = doc(db, "products", prod.firestoreId);
        await updateDoc(prodRef, updatedFields);
        showToast(`${prod.name} successfully updated!`);
      } catch (err) {
        console.error("Error updating catalog product in Firestore:", err);
        alert("Failed to update product: " + err.message);
      }
    } else {
      // It's a mock product not in Firestore. Create a new document in Firestore!
      try {
        const docRef = await addDoc(collection(db, "products"), {
          ...prod,
          ...updatedFields,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error creating product in Firestore:", err);
        alert("Failed to save product in DB: " + err.message);
      }
    }
  };

  const handleAdminAddProduct = async () => {
    if (!adminNewProductName || !adminNewProductPrice) {
      alert("Please enter product name and price!");
      return;
    }
    const price = parseFloat(adminNewProductPrice);
    const originalPrice = parseFloat(adminNewProductOrigPrice) || 0;
    if (isNaN(price)) {
      return alert("Please enter a valid price!");
    }

    const finalCategory = adminNewProductCategory === 'custom' ? adminCustomCategory.trim() : adminNewProductCategory;
    const finalStore = adminNewProductStore === 'custom' ? adminCustomStore.trim() : adminNewProductStore || (shops[0]?.storeName || shops[0]?.name || 'PixoGo Store');

    if (!finalCategory) return alert("Please specify a category!");
    if (!finalStore) return alert("Please specify a shop!");

    const newProd = {
      id: `p_${Date.now()}`,
      name: adminNewProductName,
      price: price,
      originalPrice: originalPrice,
      offerText: adminNewProductOffer,
      category: finalCategory,
      store: finalStore,
      image: adminNewProductImage || '🍔',
      isVeg: adminNewProductIsVeg,
      approved: true, // Admin catalog additions are pre-approved!
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "products"), newProd);
      showToast(`${adminNewProductName} successfully added to global catalog!`);
      // Reset fields
      setAdminNewProductName('');
      setAdminNewProductPrice('');
      setAdminNewProductOrigPrice('');
      setAdminNewProductOffer('');
      setAdminNewProductImage('');
      setAdminNewProductCategory('Bakery');
      setAdminNewProductStore('');
      setAdminCustomCategory('');
      setAdminCustomStore('');
      setAdminNewProductIsVeg(true);
      setIsAdminAddFormOpen(false);
    } catch (err) {
      console.error("Error adding product to Firestore:", err);
      alert(`Failed to add product: ${err.message}`);
    }
  };

  // Add Item to Cart

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
    showToast(`${product.name} added to cart!`, 'success');
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
      const cartSubtotal = cart.reduce((acc, i) => acc + (getProductFinalPrice(i) * i.quantity), 0);
      setAppliedDiscount(Math.round(cartSubtotal * 0.1));
      alert('Coupon Applied Successfully: 10% Off!');
    } else {
      alert('Invalid or expired coupon code!');
    }
  };

  // Checkout and Order Placement
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert('Your cart is empty!');

    // Check store-specific operating hours and manual toggle status
    const storeName = cart[0]?.store || 'Store';
    const cartShop = shops.find(s => s.name === storeName || s.storeName === storeName);
    const shopStatus = getShopOpenStatus(cartShop);
    if (!shopStatus.isOpen) {
      if (shopStatus.reason === 'OUTSIDE_HOURS') {
        alert(`Sorry! ${storeName} is currently closed. Operating hours are ${cartShop?.openTime || '09:00'} to ${cartShop?.closeTime || '22:00'}.`);
      } else {
        alert(`Sorry! ${storeName} is currently not accepting orders.`);
      }
      return;
    }

    if (!customerAddress) return alert('Please input your delivery coordinates / address!');

    // Check if customer already has an active order in progress
    const customerId = auth.currentUser ? auth.currentUser.uid : `guest_${customerPhone || 'anonymous'}`;
    const hasActiveOrder = orders.some(o => 
      (o.customerId === customerId || (o.customerPhone === customerPhone && customerPhone)) && 
      !['COMPLETED', 'DELIVERED'].includes(o.status?.toUpperCase()) &&
      !o.status?.toUpperCase().startsWith('CANCEL')
    );
    if (hasActiveOrder) {
      alert("You already have an active order in progress! Please wait for it to be completed or cancelled before placing a new one.");
      return;
    }

    const cartSubtotal = cart.reduce((acc, i) => acc + (getProductFinalPrice(i) * i.quantity), 0);
    
    // Calculate dynamic distance and rates
    const customerCoords = parseCoords(customerAddress);
    const shopLat = cartShop?.lat || 24.8887;
    const shopLng = cartShop?.lng || 74.6269;
    
    let distanceVal = 1.0;
    if (deliveryDistance !== null) {
      distanceVal = deliveryDistance;
    } else if (customerCoords) {
      distanceVal = await fetchRoadDistance(shopLat, shopLng, customerCoords.lat, customerCoords.lng);
    }
      
    if (distanceVal > MAX_DELIVERY_RADIUS_KM) {
      alert(`Cannot place order. The store (${storeName}) is ${distanceVal.toFixed(2)} km away, which exceeds our maximum delivery radius of ${MAX_DELIVERY_RADIUS_KM} km.`);
      return;
    }
      
    const { customerCharge, riderPayout: riderPayoutVal } = calculateDeliveryRates(distanceVal);
    const delCharge = customerCharge;

    const total = cartSubtotal + delCharge - appliedDiscount;
    const comm = Math.round(cartSubtotal * (commissionPercent / 100));

    const merchantId = 'merch_' + storeName.replace(/\s+/g, '_').toLowerCase();

    // Determine dual order routing option based on store name and category
    const isShopDirect = ['Bake House', 'Grand Plaza Restaurant', 'Sweet Treat Cafe', 'Burger Club', 'Pizza Corner', 'Gelato Heaven'].includes(storeName) || 
                         ['Bakery', 'Fast Food', 'Restaurant Cafe', 'Icecream and dessert'].includes(cart[0]?.category);
    const routingOption = isShopDirect ? 'Option 1 (Shop-Direct)' : 'Option 2 (Managed)';

    const newOrder = {
      id: `PG-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      customerEmail,
      customerLocation: customerAddress,
      items: [...cart],
      totalAmount: total,
      deliveryCharge: delCharge,
      riderPayout: riderPayoutVal,
      distance: distanceVal,
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
      routingOption, // Set routing flow dynamically
      createdAt: new Date().toISOString()
    };

    if (selectedPayment === 'ONLINE') {
      setPendingPaymentOrder(newOrder);
      setCheckoutStep('payment');
      setIsCartDrawerOpen(true);
      return;
    }

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

  // Admin: Cancel Order
  const handleAdminCancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!window.confirm(`Are you sure you want to cancel Order ${orderId}?`)) {
      return;
    }

    // Update local state first
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED_BY_ADMIN' } : o));
    if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
      setSelectedOrderDetails(prev => prev ? { ...prev, status: 'CANCELLED_BY_ADMIN' } : null);
    }

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, { 
          status: 'CANCELLED_BY_ADMIN',
          cancelledBy: 'Admin',
          cancelledAt: new Date().toISOString()
        });
        showToast(`Order ${orderId} Cancelled by Admin.`);
      } catch (err) {
        console.error("Error updating order status in Firestore:", err);
        alert(`Failed to cancel order in database: ${err.message}`);
      }
    } else {
      showToast(`Order ${orderId} Cancelled.`);
    }
  };

  // Admin: Initiate Re-route selection UI
  const handleAdminRerouteOrder = (orderId) => {
    setReroutingOrderId(orderId);
    setRerouteSelectedShop('');
    setRerouteSelectedRider('');
  };

  // Admin: Submit the Re-routing details to Firestore
  const handleAdminSubmitReroute = async (orderId) => {
    if (!rerouteSelectedShop) {
      alert("Please select a store to re-route!");
      return;
    }
    const shop = shops.find(s => s.id === rerouteSelectedShop);
    if (!shop) return;
    const rider = deliveryPartners.find(d => d.id === rerouteSelectedRider);

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedFields = {
      status: rider ? 'ASSIGNED' : 'ACCEPTED',
      merchantId: shop.id,
      merchantName: shop.storeName || shop.name,
      routingOption: 'Option 2 (Managed)', // default to managed for manual re-routing
      deliveryPartnerId: rider ? rider.id : null,
      deliveryPartnerName: rider ? rider.name : '',
      riderId: rider ? rider.id : null,
      reroutedAt: new Date().toISOString()
    };

    // Update local state first
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatedFields } : o));

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, updatedFields);
        showToast(`Order ${orderId} successfully re-routed!`);
        
        // Reset states
        setReroutingOrderId(null);
        setRerouteSelectedShop('');
        setRerouteSelectedRider('');
      } catch (err) {
        console.error("Error submitting re-routed order to Firestore:", err);
      }
    }
  };

  // Merchant: Toggle order acceptance status (Manual override)
  const handleToggleAcceptingOrders = async (shop, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Update local state first
    setShops(prevShops => prevShops.map(s => s.id === shop.id ? { ...s, isAcceptingOrders: newStatus } : s));
    
    if (shop.firestoreId) {
      try {
        const docRef = doc(db, "merchants", shop.firestoreId);
        await updateDoc(docRef, { isAcceptingOrders: newStatus });
      } catch (err) {
        console.error("Error updating shop order acceptance in Firestore:", err);
      }
    }
    showToast(`Store is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
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

  // Merchant: Reject / Cancel Order
  const handleMerchantRejectOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update local state first
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED_BY_STORE' } : o));

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, { 
          status: 'CANCELLED_BY_STORE',
          cancelledBy: 'Merchant',
          cancelledAt: new Date().toISOString()
        });
        showToast(`Order ${orderId} Rejected.`);
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

  const handleRiderAcceptJob = async (orderId) => {
    let rider = deliveryPartners.find(d => d.id === user?.uid);
    if (!rider && user) {
      // Fallback rider object for Admin/Tester accounts
      rider = {
        id: user.uid,
        name: user.name || 'Admin Tester',
        phone: '9251054064',
        vehicle: 'TEST-BIKE-1'
      };
    }
    if (!rider) {
      showToast("Error: Rider profile not found.");
      return;
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.deliveryPartnerId) {
      alert("This delivery job has already been claimed by another rider.");
      return;
    }

    // Update local state first
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'ASSIGNED',
          deliveryPartnerId: user.uid,
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
          deliveryPartnerId: user.uid,
          deliveryPartnerName: rider.name,
          riderId: user.uid
        });

        // Set rider status to busy in delivery_boys collection
        const riderDocRef = doc(db, "delivery_boys", user.uid);
        await setDoc(riderDocRef, {
          status: 'busy',
          updatedAt: new Date().toISOString()
        }, { merge: true });

        showToast(`Successfully claimed delivery job for Order ${orderId}!`);
      } catch (err) {
        console.error("Error accepting job in Firestore:", err);
        showToast("Failed to claim job. Please try again.");
      }
    }
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

    const cleanEmail = newShopEmail.trim().toLowerCase();
    const existingRole = getRoleForEmail(cleanEmail);
    if (existingRole) {
      alert(`This email address is already registered as a ${existingRole}. An email can only have one role.`);
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

  const handleMerchantOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardShopName || !onboardShopCategory || !onboardShopPhone || !onboardShopEmail || !onboardShopAddress) {
      alert("Please fill in all the details for the onboarding request.");
      return;
    }
    const cleanEmail = onboardShopEmail.trim().toLowerCase();
    const existingRole = getRoleForEmail(cleanEmail);
    if (existingRole) {
      alert(`This email address is already registered as a ${existingRole}. An email can only have one role.`);
      return;
    }
    const newShopId = `merch_${onboardShopName.trim().replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    try {
      await setDoc(doc(db, "merchants", newShopId), {
        id: newShopId,
        storeName: onboardShopName.trim(),
        category: onboardShopCategory,
        phone: onboardShopPhone.trim(),
        address: onboardShopAddress.trim(),
        email: onboardShopEmail.trim().toLowerCase(),
        verified: false,
        docs: 'Pending',
        createdAt: new Date().toISOString()
      });
      alert(`Onboarding request submitted successfully for "${onboardShopName.trim()}"!\nOur admin will review your request and create your account.`);
      setOnboardShopName('');
      setOnboardShopPhone('');
      setOnboardShopEmail('');
      setOnboardShopAddress('');
      setIsSignUp(false); // Switch back to sign in
    } catch (err) {
      console.error("Error submitting shop onboarding request:", err);
      alert(`Failed to submit request: ${err.message}`);
    }
  };

  const handleRiderOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardRiderName || !onboardRiderEmail || !onboardRiderPhone || !onboardRiderVehicle) {
      alert("Please fill in all the details for the rider onboarding request.");
      return;
    }
    const cleanEmail = onboardRiderEmail.trim().toLowerCase();
    const existingRole = getRoleForEmail(cleanEmail);
    if (existingRole) {
      alert(`This email address is already registered as a ${existingRole}. An email can only have one role.`);
      return;
    }
    const newRiderId = `rider_${Date.now()}`;
    try {
      await setDoc(doc(db, "delivery_boys", newRiderId), {
        id: newRiderId,
        name: onboardRiderName.trim(),
        email: onboardRiderEmail.trim().toLowerCase(),
        phone: onboardRiderPhone.trim(),
        vehicle: onboardRiderVehicle.trim(),
        active: true,
        verified: false, // Pending verification
        totalDeliveries: 0,
        pendingPayout: 0,
        createdAt: new Date().toISOString()
      });
      alert(`Onboarding request submitted successfully for rider "${onboardRiderName.trim()}"!\nOur admin will review your request and create your account.`);
      setOnboardRiderName('');
      setOnboardRiderEmail('');
      setOnboardRiderPhone('');
      setOnboardRiderVehicle('');
      setIsSignUp(false); // Switch back to sign in
    } catch (err) {
      console.error("Error submitting rider onboarding request:", err);
      alert(`Failed to submit request: ${err.message}`);
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
    setShopDocLat(shop.lat !== undefined ? shop.lat.toString() : '');
    setShopDocLng(shop.lng !== undefined ? shop.lng.toString() : '');
    setTempAuthEmail(shop.email || '');
    setTempAuthPassword('');
    setIsShopModalOpen(true);
  };

  const handleAdminSaveShopDocs = async () => {
    if (!selectedShopDetails) return;
    
    const parsedLat = shopDocLat.trim() !== '' ? parseFloat(shopDocLat) : null;
    const parsedLng = shopDocLng.trim() !== '' ? parseFloat(shopDocLng) : null;

    try {
      if (selectedShopDetails.firestoreId) {
        const docRef = doc(db, "merchants", selectedShopDetails.firestoreId);
        await updateDoc(docRef, {
          hasAadhaar: shopDocAadhaar,
          hasPan: shopDocPan,
          hasFssai: shopDocFssai,
          lat: parsedLat,
          lng: parsedLng
        });
      }
      // Update local shops state
      setShops(shops.map(s => s.id === selectedShopDetails.id ? { 
        ...s, 
        hasAadhaar: shopDocAadhaar, 
        hasPan: shopDocPan, 
        hasFssai: shopDocFssai,
        lat: parsedLat !== null ? parsedLat : undefined,
        lng: parsedLng !== null ? parsedLng : undefined
      } : s));
      showToast('Shop details and coordinates updated successfully!');
      setIsShopModalOpen(false);
      setSelectedShopDetails(null);
    } catch (err) {
      console.error("Error updating shop documents:", err);
      alert(`Failed to save updates: ${err.message}`);
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
      if (rider) {
        if (status) {
          // Approve
          if (rider.firestoreId) {
            try {
              const docRef = doc(db, "delivery_boys", rider.firestoreId);
              await updateDoc(docRef, { verified: true });
            } catch (err) {
              console.error("Error updating rider verification in Firestore:", err);
            }
          }
          setDeliveryPartners(deliveryPartners.map(d => d.id === id ? { ...d, verified: true } : d));
        } else {
          // Reject -> Delete application
          if (rider.firestoreId) {
            try {
              const docRef = doc(db, "delivery_boys", rider.firestoreId);
              await deleteDoc(docRef);
            } catch (err) {
              console.error("Error deleting rider application in Firestore:", err);
            }
          }
          setDeliveryPartners(deliveryPartners.filter(d => d.id !== id));
          showToast("Rider onboarding request rejected.");
        }
      }
    }
  };

  // Rider: Validate OTP and Deliver
  const [riderInputOTP, setRiderInputOTP] = useState('');
  const handleRiderCompleteDelivery = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (riderInputOTP.trim().toString() !== (order.otp || '').toString().trim()) {
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
        const riderObj = deliveryPartners.find(d => d.id === order.deliveryPartnerId);
        const currentDeliveries = riderObj?.totalDeliveries || 0;
        const currentPayout = riderObj?.pendingPayout || 0;
        const payoutIncrement = order.riderPayout !== undefined ? order.riderPayout : order.deliveryCharge;
        
        await setDoc(riderDocRef, {
          status: 'available',
          totalDeliveries: currentDeliveries + 1,
          pendingPayout: currentPayout + payoutIncrement,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Error updating delivery boy status and payouts in Firestore:", err);
      }
    }

    // Update Rider totals locally
    setDeliveryPartners(deliveryPartners.map(d => {
      if (d.id === order.deliveryPartnerId) {
        const payoutIncrement = order.riderPayout !== undefined ? order.riderPayout : order.deliveryCharge;
        return {
          ...d,
          totalDeliveries: d.totalDeliveries + 1,
          pendingPayout: d.pendingPayout + payoutIncrement
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

  const handleSaveRiderAnnouncement = async () => {
    try {
      const announceDocRef = doc(db, "configs", "rider_announcement");
      await setDoc(announceDocRef, {
        text: riderAnnouncementEdit,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast("Rider announcement updated successfully!");
      alert("Rider announcement saved to Firebase Firestore.");
    } catch (err) {
      console.error("Error saving rider announcement:", err);
      alert(`Failed to save announcement: ${err.message}`);
    }
  };

  const handleSaveCustomerAnnouncement = async () => {
    try {
      const announceDocRef = doc(db, "configs", "customer_announcement");
      await setDoc(announceDocRef, {
        text: customerAnnouncementEdit,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast("Customer announcement updated successfully!");
      alert("Customer announcement saved to Firebase Firestore.");
    } catch (err) {
      console.error("Error saving customer announcement:", err);
      alert(`Failed to save announcement: ${err.message}`);
    }
  };

  const handleCreateAuthAccount = async (type, email, password, id) => {
    if (!email || !password) {
      alert("Please provide both email/username and password.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    
    let targetEmail = email.trim();
    if (!targetEmail.includes('@')) {
      targetEmail = `${targetEmail.toLowerCase().replace(/\s+/g, '')}@pixigo.com`;
    }

    try {
      showToast("Creating auth account... Please wait.");
      
      const tempAppName = `TempApp_${Date.now()}`;
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);
      
      const userCredential = await createUserWithEmailAndPassword(tempAuth, targetEmail, password);
      const newUid = userCredential.user.uid;
      
      await deleteApp(tempApp);

      if (type === 'merchant') {
        const merchant = shops.find(s => s.id === id);
        if (merchant) {
          const docId = merchant.firestoreId || merchant.id;
          const docRef = doc(db, "merchants", docId);
          await setDoc(docRef, { 
            id: merchant.id,
            storeName: merchant.storeName || merchant.name,
            category: merchant.category,
            phone: merchant.phone || '9251054064',
            address: merchant.address || 'Vaishali Market, Jaipur (RJ)',
            verified: merchant.verified ?? true,
            docs: merchant.docs || 'Approved',
            hasAuthAccount: true,
            authUid: newUid,
            email: targetEmail
          }, { merge: true });
        }
      } else if (type === 'rider') {
        const rider = deliveryPartners.find(d => d.id === id);
        if (rider) {
          const docId = rider.firestoreId || rider.id;
          const docRef = doc(db, "delivery_boys", docId);
          await setDoc(docRef, { 
            id: rider.id,
            name: rider.name,
            password: password,
            email: targetEmail,
            phone: rider.phone || '9251054064',
            vehicle: rider.vehicle || 'RJ-14-AB-1234',
            verified: rider.verified ?? true,
            active: rider.active ?? true,
            hasAuthAccount: true,
            authUid: newUid
          }, { merge: true });
        }
      }

      setTempAuthPassword('');
      alert(`Firebase Auth Account successfully created for ${targetEmail}!\nThey can now log into their console.`);
      showToast("Auth account created successfully!");
    } catch (error) {
      console.error("Error creating auth account:", error);
      alert(`Failed to create auth account: ${error.message}`);
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
      isVeg: newProductIsVeg,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, "products"), newProd);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductIsVeg(true);
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

  // Filter products by search, mode, category, and veg/non-veg type
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
    const matchVeg = vegFilter === 'All' || 
                     (vegFilter === 'Veg' && p.isVeg !== false) || 
                     (vegFilter === 'NonVeg' && p.isVeg === false);
    return matchQuery && matchCat && matchVeg;
  });

  // Compute active orders for the current customer (excluding completed, delivered, and cancelled ones)
  const activeCustomerOrders = orders.filter(o => {
    const emailVal = (o.customerEmail || o.email || '').trim().toLowerCase();
    const targetEmail = customerEmail.trim().toLowerCase();
    const isEmailMatch = emailVal === targetEmail;
    const isUidMatch = user && o.userId && o.userId === user.uid;
    const isPhoneMatch = o.customerPhone && o.customerPhone.trim() === customerPhone.trim();
    const isUserOrder = isEmailMatch || isUidMatch || isPhoneMatch;
    const isActive = o.status && 
      o.status.toUpperCase() !== 'COMPLETED' && 
      o.status.toUpperCase() !== 'DELIVERED' && 
      !o.status.toUpperCase().startsWith('CANCEL');
    return isUserOrder && isActive;
  });

  const trackingOrderIdForHook = currentOrderTracking || activeCustomerOrders[0]?.id;
  const liveRiderCoords = useRiderLocation(trackingOrderIdForHook);

  // UPI payment success confirmation & WhatsApp redirection
  const handleConfirmUpiPayment = async (isDrawer) => {
    if (!pendingPaymentOrder) return;
    
    try {
      // Save order to Firestore Database
      await addDoc(collection(db, "orders"), pendingPaymentOrder);

      // Auto-sync merchant profile doc if it does not exist
      const merchantId = pendingPaymentOrder.merchantId;
      const storeName = pendingPaymentOrder.merchantName;
      try {
        const merchantDocRef = doc(db, "merchants", merchantId);
        const merchSnap = await getDoc(merchantDocRef);
        if (!merchSnap.exists()) {
          await setDoc(merchantDocRef, {
            storeName: storeName,
            category: pendingPaymentOrder.items[0]?.category || 'General',
            address: 'Store Address, Chittorgarh',
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Error auto-syncing merchant document:", err);
      }

      // Update local state for immediate UI tracking feedback
      setOrders([pendingPaymentOrder, ...orders]);
      setCart([]);
      setCouponCode('');
      setAppliedDiscount(0);
      setCurrentOrderTracking(pendingPaymentOrder.id);
      setIsTrackingDrawerOpen(true);
      
      // WhatsApp message template construction
      const message = `Hello, I have placed order ${pendingPaymentOrder.id} for ₹${pendingPaymentOrder.totalAmount}. Here is my payment screenshot.`;
      const waUrl = `https://wa.me/918233816674?text=${encodeURIComponent(message)}`;
      
      // Reset checkout states
      setCheckoutStep('cart');
      setPendingPaymentOrder(null);
      if (isDrawer) setIsCartDrawerOpen(false);

      showToast("Order placed! Redirecting to WhatsApp...", "success");
      
      // Open WhatsApp
      window.open(waUrl, '_blank');
    } catch (error) {
      alert(`Failed to save order to Database: ${error.message}`);
    }
  };

  // Reusable cart content rendering (sidebar & mobile drawer)
  const renderCartContent = (isDrawer = false) => {
    if (checkoutStep === 'payment' && pendingPaymentOrder) {
      const upiUrl = `upi://pay?pa=8233816674@upi&pn=PIXIgo%20Delivery&am=${pendingPaymentOrder.totalAmount}&cu=INR&tn=PIXIgo%20Order%20${pendingPaymentOrder.id}`;
      return (
        <div className={`cart-card ${!isDrawer ? 'glass-panel' : ''}`} style={{ textAlign: 'left' }}>
          <div className="cart-header-row">
            <h2 className="section-title" style={{ color: 'var(--color-primary)' }}>
              🔒 UPI Payment Instructions
            </h2>
            {isDrawer && (
              <button className="close-drawer-btn" onClick={() => setIsCartDrawerOpen(false)}>
                <X size={20} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            
            {/* Gateway Progress Notification */}
            <div className="payment-alert-box" style={{
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              color: '#f87171',
              fontSize: '12px',
              lineHeight: '1.5',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                ⚙️ Payment Gateway Integration in Progress
              </div>
              <p style={{ margin: 0 }}>
                Our automatic payment system is currently being set up. Meanwhile, please make payment using the UPI details below and send the transaction screenshot on WhatsApp to confirm your order.
              </p>
            </div>

            {/* Total Amount to Pay */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>Total Amount to Pay:</span>
              <strong style={{ fontSize: '24px', color: '#ffb300' }}>
                {formatINR(pendingPaymentOrder.totalAmount)}
              </strong>
            </div>

            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                Step 1: Copy our UPI ID and pay
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(218, 165, 32, 0.08)',
                border: '1px solid rgba(218, 165, 32, 0.25)',
                borderRadius: '24px',
                padding: '8px 16px',
                fontSize: '14px'
              }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ffd700' }}>8233816674@upi</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('8233816674@upi');
                    showToast('UPI ID copied to clipboard!', 'success');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffd700',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Copy ID
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                Step 2: Pay instantly via any UPI App
              </span>
              <a 
                href={upiUrl}
                className="neon-btn"
                style={{
                  background: 'var(--color-danger)',
                  borderColor: 'var(--color-danger)',
                  color: '#ffffff',
                  width: '100%',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontWeight: 'bold',
                  boxShadow: 'none'
                }}
              >
                Pay via UPI / Paytm App
              </a>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                Step 3: Send screenshot to WhatsApp
              </span>
              <button 
                onClick={() => handleConfirmUpiPayment(isDrawer)}
                className="neon-btn"
                style={{
                  background: '#25D366',
                  borderColor: '#25D366',
                  color: '#ffffff',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.2)'
                }}
              >
                <MessageCircle size={18} /> Confirm on WhatsApp
              </button>
            </div>

            <div className="divider" style={{ margin: '8px 0' }}></div>

            {/* Cancel Payment */}
            <button 
              onClick={() => {
                setCheckoutStep('cart');
                setPendingPaymentOrder(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline'
              }}
            >
              Cancel & Go Back
            </button>
          </div>
        </div>
      );
    }

    const storeName = cart[0]?.store || '';
    const cartShop = shops.find(s => s.name === storeName || s.storeName === storeName);
    const customerCoords = parseCoords(customerAddress);
    
    let dist = null;
    let isOutOfRange = false;
    if (cart[0] && cartShop && customerCoords) {
      dist = deliveryDistance;
      if (dist === null) {
        const shopLat = cartShop.lat || 24.8887;
        const shopLng = cartShop.lng || 74.6269;
        dist = getDistance(shopLat, shopLng, customerCoords.lat, customerCoords.lng);
      }
      isOutOfRange = dist > MAX_DELIVERY_RADIUS_KM;
    }

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
                  <span className="cart-item-sub">
                    {formatINR(item.price)} each 
                    {item.originalPrice > item.price && (
                      <span style={{ textDecoration: 'line-through', fontSize: '10px', marginLeft: '4px', color: 'var(--color-text-muted)' }}>
                        {formatINR(item.originalPrice)}
                      </span>
                    )}
                  </span>
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

            {isOutOfRange && dist !== null && (
              <div className="cart-warning-banner" style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '10px 12px',
                marginBottom: '14px',
                color: '#f87171',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Delivery Range Exceeded:</strong> {storeName} is {dist.toFixed(2)} km away. We only deliver up to {MAX_DELIVERY_RADIUS_KM} km. Please select a closer address or clear cart to order from elsewhere.
                </span>
              </div>
            )}

            {/* Pricing summary */}
            {(() => {
              const subtotal = cart.reduce((acc, i) => acc + (getProductFinalPrice(i) * i.quantity), 0);
              
              let distanceText = '';
              let fee = 33; // Default fallback (standard 2km base)
              
              if (dist !== null) {
                distanceText = isDistanceLoading 
                  ? ' (Calculating route...)' 
                  : ` (${dist.toFixed(2)} km)`;
                const rates = calculateDeliveryRates(dist);
                fee = rates.customerCharge;
              }
              
              return (
                <div className="price-summary">
                  <div className="summary-row">
                    <span>Items Subtotal</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee{distanceText}</span>
                    <span>{isOutOfRange ? 'N/A' : formatINR(fee)}</span>
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
                    <span>{isOutOfRange ? 'N/A' : formatINR(subtotal + fee - appliedDiscount)}</span>
                  </div>
                </div>
              );
            })()}

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
                  merchantCoords={cartShop ? { lat: cartShop.lat || 24.8887, lng: cartShop.lng || 74.6269 } : { lat: 26.9015, lng: 75.7482 }}
                  customerCoords={customerCoords}
                  customerName={customerName || 'Customer'}
                  merchantName={storeName || "Store"}
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
            <button 
              className="neon-btn checkout-btn" 
              disabled={isOutOfRange || isDistanceLoading}
              onClick={() => {
                if (isOutOfRange) {
                  showToast(`⚠️ Cannot place order. Delivery distance is too far (${dist?.toFixed(1)} km).`);
                  return;
                }
                handlePlaceOrder();
                if (isDrawer) setIsCartDrawerOpen(false);
              }}
              style={{
                background: isOutOfRange ? 'rgba(255, 255, 255, 0.05)' : 'var(--color-primary)',
                color: isOutOfRange ? 'var(--color-text-muted)' : '#000',
                border: isOutOfRange ? '1px solid var(--color-border)' : 'none',
                cursor: isOutOfRange ? 'not-allowed' : 'pointer'
              }}
            >
              {isOutOfRange ? (
                <>Out of Delivery Range ({dist?.toFixed(1)} km) <X size={18} /></>
              ) : isDistanceLoading ? (
                <>Calculating Route... <RefreshCw size={18} className="spin" /></>
              ) : (
                <>Confirm & Place Order <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPortalGuard = (portalName, children) => {
    if (!user) {
      const isRider = portalName === 'Delivery Rider';
      const showSignUpForm = (portalName === 'Merchant Dashboard' || portalName === 'Delivery Rider') ? isSignUp : false;
      const portalThemeClass = portalName === 'Admin Console' ? 'portal-theme-admin' :
                               portalName === 'Delivery Rider' ? 'portal-theme-delivery' :
                               'portal-theme-merchant';

      return (
        <div className={`portal-auth-scene ${portalThemeClass} fade-in`} style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
          
          {isRider && riderAnnouncement && (
            <div className="rider-announcement-banner" style={{
              width: '100%',
              maxWidth: '450px',
              padding: '8px 16px',
              background: 'rgba(0, 255, 242, 0.05)',
              border: '1px solid rgba(0, 255, 242, 0.15)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 10px rgba(0, 255, 242, 0.05)',
              marginBottom: '10px'
            }}>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '800', 
                color: 'var(--color-primary)', 
                background: 'rgba(0, 255, 242, 0.15)', 
                padding: '3px 8px', 
                borderRadius: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                📢 Notice
              </span>
              <marquee 
                behavior="scroll" 
                direction="left" 
                scrollamount="4" 
                style={{ 
                  fontSize: '12px', 
                  color: '#00fff2', 
                  textShadow: '0 0 4px rgba(0, 255, 242, 0.3)',
                  fontWeight: '600', 
                  margin: 0,
                  padding: 0
                }}
              >
                {riderAnnouncement}
              </marquee>
            </div>
          )}

          <div className="portal-bg-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
          </div>
          <div className="portal-floating-particles">
            {[...Array(8)].map((_, i) => <div key={i} className={`particle particle-${i+1}`}></div>)}
          </div>
          <div className="portal-auth-card-dark">
            <div className="portal-card-glow-ring"></div>
            <div className="auth-icon-badge-dark">
              {portalName === 'Admin Console' ? <Shield size={36} className="auth-icon-svg" /> :
               portalName === 'Delivery Rider' ? <Bike size={36} className="auth-icon-svg" /> :
               <Store size={36} className="auth-icon-svg" />}
            </div>
            <h2 className="auth-portal-title-dark">{portalName}</h2>
            <p className="auth-portal-subtitle-dark">Authentication Required to Access Staff Panel</p>

            {authError && (
              <div className={`auth-error-banner fade-in ${authError.toLowerCase().includes('sent') || authError.toLowerCase().includes('submitted') ? 'auth-info-banner' : ''}`}>
                {authError.toLowerCase().includes('sent') || authError.toLowerCase().includes('submitted') ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{authError}</span>
              </div>
            )}
            
            {portalName === 'Merchant Dashboard' && showSignUpForm ? (
              <form onSubmit={handleMerchantOnboardSubmit} className="auth-form-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group-premium">
                  <label className="form-label-premium">Shop Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bake House" 
                    value={onboardShopName}
                    onChange={(e) => setOnboardShopName(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Category</label>
                  <select 
                    value={onboardShopCategory}
                    onChange={(e) => setOnboardShopCategory(e.target.value)}
                    className="custom-input-premium"
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 9251054064" 
                    value={onboardShopPhone}
                    onChange={(e) => setOnboardShopPhone(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Merchant Login Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. owner@gmail.com" 
                    value={onboardShopEmail}
                    onChange={(e) => setOnboardShopEmail(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Shop Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. C-Scheme, Jaipur" 
                    value={onboardShopAddress}
                    onChange={(e) => setOnboardShopAddress(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <button type="submit" className="neon-btn auth-submit-btn-premium">
                  Submit Onboarding Request
                </button>
              </form>
            ) : portalName === 'Delivery Rider' && showSignUpForm ? (
              <form onSubmit={handleRiderOnboardSubmit} className="auth-form-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group-premium">
                  <label className="form-label-premium">Rider Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. JohnDoe" 
                    value={onboardRiderName}
                    onChange={(e) => setOnboardRiderName(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Email ID</label>
                  <input 
                    type="email" 
                    placeholder="e.g. john@example.com" 
                    value={onboardRiderEmail}
                    onChange={(e) => setOnboardRiderEmail(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 9251054064" 
                    value={onboardRiderPhone}
                    onChange={(e) => setOnboardRiderPhone(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Vehicle Details</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Splendor (RJ-14-SG-2024)" 
                    value={onboardRiderVehicle}
                    onChange={(e) => setOnboardRiderVehicle(e.target.value)}
                    className="custom-input-premium"
                    required
                  />
                </div>
                <button type="submit" className="neon-btn auth-submit-btn-premium">
                  Submit Onboarding Request
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuthAction} className="auth-form-premium">
                <div className="form-group-premium">
                  <label className="form-label-premium">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
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

                <div style={{ textAlign: 'center', marginTop: '4px', marginBottom: '8px' }}>
                  <button 
                    type="button" 
                    className="toggle-btn-link-premium" 
                    style={{ fontSize: '11px', opacity: 0.8 }} 
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
                
                <button type="submit" className="neon-btn auth-submit-btn-premium">
                  Sign In to Panel
                </button>
              </form>
            )}

            {portalName === 'Admin Console' && (
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

            {portalName === 'Delivery Rider' ? (
              <p className="auth-toggle-text-premium">
                {showSignUpForm ? 'Already registered?' : 'Need a new rider account?'} {' '}
                <button type="button" className="toggle-btn-link-premium" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
                  {showSignUpForm ? 'Sign In Instead' : 'Register Now'}
                </button>
              </p>
            ) : portalName === 'Merchant Dashboard' ? (
              <p className="auth-toggle-text-premium">
                {showSignUpForm ? 'Already registered?' : 'Need a new merchant account?'} {' '}
                <button type="button" className="toggle-btn-link-premium" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
                  {showSignUpForm ? 'Sign In Instead' : 'Create Account'}
                </button>
              </p>
            ) : (
              <p className="auth-toggle-text-premium">
                Need a new panel account? {' '}
                <button type="button" className="toggle-btn-link-premium" onClick={() => setAuthError('Request is sent to the administrator. Please contact your Administrator for the Admin Account.')}>
                  Create New Admin Account
                </button>
              </p>
            )}

            <div className="chittortech-branding-footer-dark">
              <span className="branding-text-muted-dark">Powered and maintained by</span>
              <div className="chittortech-logo-premium">
                <img src="/chittortech_logo.png" alt="Chittortech Logo" className="chittortech-logo-img" />
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (portalName === 'Delivery Rider' && userRole !== 'admin') {
      const currentRider = deliveryPartners.find(d => d.id === user.uid || d.email === user.email);
      
      if (!currentRider) {
        return (
          <div className="portal-auth-scene portal-theme-delivery fade-in">
            <div className="portal-bg-orbs"><div className="orb orb-1"></div><div className="orb orb-2"></div></div>
            <div className="portal-auth-card-dark" style={{ textAlign: 'center' }}>
              <div className="portal-card-glow-ring"></div>
              <div className="auth-icon-badge-dark" style={{ margin: '0 auto 16px', background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239,68,68,0.4)' }}>
                <AlertCircle size={36} style={{ color: '#ef4444' }} />
              </div>
              <h2 className="auth-portal-title-dark">Access Denied</h2>
              <p className="auth-portal-subtitle-dark">
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
          <div className="portal-auth-scene portal-theme-delivery fade-in">
            <div className="portal-bg-orbs"><div className="orb orb-1"></div><div className="orb orb-2"></div></div>
            <div className="portal-auth-card-dark" style={{ textAlign: 'center' }}>
              <div className="portal-card-glow-ring"></div>
              <div className="auth-icon-badge-dark" style={{ margin: '0 auto 16px', background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245,158,11,0.4)' }}>
                <Activity size={36} style={{ color: '#f59e0b' }} />
              </div>
              <h2 className="auth-portal-title-dark">Approval Pending</h2>
              <p className="auth-portal-subtitle-dark">
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
      {!(activeTab !== 'customer' && !user) && (
        <header className={`app-header glass-panel ${activeTab === 'admin' ? 'admin-header-black' : ''}`}>
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
                {activeTab === 'admin' && <span className="brand-light" style={{ fontSize: '15px', marginLeft: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>Manager Console</span>}
                {activeTab === 'merchant' && <span className="brand-light" style={{ fontSize: '15px', marginLeft: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>Merchant Shop Console</span>}
              </div>
              <p className="tagline">Quick Home Delivery Service</p>
            </div>
          </div>

          {/* Admin Console Navigation in Header */}
          {activeTab === 'admin' && (
            <nav className="header-nav">
              <button 
                className={`nav-link ${adminSubView === 'sales' ? 'active' : ''}`}
                onClick={() => { setAdminSubView('sales'); setAdminSearchQuery(''); }}
              >
                <Activity size={16} style={{ marginRight: '6px' }} />
                Sales Dashboard
              </button>
              <button 
                className={`nav-link ${adminSubView === 'orders' ? 'active' : ''}`}
                onClick={() => { setAdminSubView('orders'); setAdminSearchQuery(''); }}
              >
                <ShoppingCart size={16} style={{ marginRight: '6px' }} />
                Total Orders ({stats.totalOrders})
              </button>
              <button 
                className={`nav-link ${adminSubView === 'shops' ? 'active' : ''}`}
                onClick={() => { setAdminSubView('shops'); setAdminSearchQuery(''); }}
              >
                <Store size={16} style={{ marginRight: '6px' }} />
                Active Shops ({stats.activeMerchants})
              </button>
              <button 
                className={`nav-link ${adminSubView === 'riders' ? 'active' : ''}`}
                onClick={() => { setAdminSubView('riders'); setAdminSearchQuery(''); }}
              >
                <Bike size={16} style={{ marginRight: '6px' }} />
                Active Riders ({stats.activeRiders})
              </button>
              <button 
                className={`nav-link ${adminSubView === 'items' ? 'active' : ''}`}
                onClick={() => { setAdminSubView('items'); setAdminSearchQuery(''); }}
              >
                <Package size={16} style={{ marginRight: '6px' }} />
                All Items ({products.length})
              </button>
              <button 
                className={`nav-link ${adminSubView === 'users' ? 'active' : ''}`}
                onClick={() => { setAdminSubView('users'); setAdminSearchQuery(''); }}
              >
                <Users size={16} style={{ marginRight: '6px' }} />
                All Users ({compiledAllUsers.length})
              </button>
              <button 
                className={`nav-link ${adminSubView === 'settings' ? 'active' : ''}`}
                onClick={() => { setAdminSubView('settings'); setAdminSearchQuery(''); }}
              >
                <Settings size={16} style={{ marginRight: '6px' }} />
                Settings
              </button>
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
            {activeTab === 'customer' && activeCustomerOrders.length > 0 && (
              <button 
                className="cart-header-icon-btn active-tracking-btn pulse-glow" 
                onClick={() => {
                  setCurrentOrderTracking(activeCustomerOrders[0].id);
                  setIsTrackingDrawerOpen(true);
                }} 
                title="Track Active Order"
                style={{ border: '1px solid var(--color-primary-glow-strong)', color: 'var(--color-primary)' }}
              >
                <Compass size={20} className="spin-slow" />
              </button>
            )}

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
      )}

      {/* Main Portals Container */}
      <main className="portal-content">
        
        {/* ==================== CUSTOMER VIEW ==================== */}
        {activeTab === 'customer' && (
          <div className="customer-portal-layout fade-in">
            
            {/* Customer Promotional Marquee (Black & Gold Theme) */}
            {customerAnnouncement && (
              <div className="customer-announcement-banner" style={{
                margin: '10px auto 16px auto',
                padding: '6px 12px',
                background: 'linear-gradient(90deg, #090703 0%, #151006 50%, #090703 100%)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflow: 'hidden',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.05)',
                width: '100%',
                maxWidth: '1200px'
              }}>
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: '900', 
                  color: '#000000', 
                  background: 'linear-gradient(90deg, #ffd700, #daa520)', 
                  padding: '2px 8px', 
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  flexShrink: 0
                }}>
                  ⭐ OFFERS
                </span>
                <marquee 
                  behavior="scroll" 
                  direction="left" 
                  scrollamount="4" 
                  style={{ 
                    fontSize: '12px', 
                    color: '#ffd700', 
                    textShadow: '0 0 4px rgba(255, 215, 0, 0.2)',
                    fontWeight: '600', 
                    margin: 0,
                    padding: 0,
                    flexGrow: 1,
                    minWidth: 0
                  }}
                >
                  {customerAnnouncement}
                </marquee>
              </div>
            )}

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
                  background: 'linear-gradient(135deg, #090d16 0%, #151b2d 100%)',
                  border: '1px solid rgba(0, 255, 242, 0.25)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 32px 0 rgba(0, 255, 242, 0.15)'
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

              {/* Veg/Non-Veg Filter Chips Row */}
              <div className="filter-chips-row">
                <button 
                  className={`filter-chip ${vegFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setVegFilter('All')}
                >
                  All Items
                </button>
                <button 
                  className={`filter-chip veg-chip ${vegFilter === 'Veg' ? 'active' : ''}`}
                  onClick={() => setVegFilter('Veg')}
                >
                  <span className="veg-dot-box green"><span className="veg-dot-circle"></span></span> Veg Only
                </button>
                <button 
                  className={`filter-chip nonveg-chip ${vegFilter === 'NonVeg' ? 'active' : ''}`}
                  onClick={() => setVegFilter('NonVeg')}
                >
                  <span className="veg-dot-box red"><span className="veg-dot-triangle"></span></span> Non-Veg Only
                </button>
              </div>

              {/* Product Grid */}
              <div className="products-grid">
                {filteredProducts.map(p => {
                  const pShop = shops.find(s => s.name === p.store || s.storeName === p.store);
                  const statusInfo = getShopOpenStatus(pShop);
                  const isClosed = !statusInfo.isOpen;

                  const customerCoords = parseCoords(customerAddress);
                  let shopDistance = null;
                  let isOutOfRange = false;
                  if (pShop && pShop.lat && pShop.lng && customerCoords) {
                    shopDistance = getDistance(pShop.lat, pShop.lng, customerCoords.lat, customerCoords.lng);
                    isOutOfRange = shopDistance > MAX_DELIVERY_RADIUS_KM;
                  }

                  return (
                    <div key={p.id} className={`product-card glass-panel`} style={{ position: 'relative' }}>
                      <div className="prod-img-wrap" style={{ position: 'relative' }}>
                        {p.image && p.image.startsWith('http') ? (
                          <img src={p.image} alt={p.name} className="prod-img" onError={(e) => {
                            e.target.style.display = 'none';
                          }} />
                        ) : (
                          <span className="prod-emoji-text">{p.image || p.emoji || '📦'}</span>
                        )}
                      </div>
                      <div className="prod-meta" style={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <h3 className="prod-title" style={{ margin: 0 }}>{p.name}</h3>
                          <span className={`veg-dot-box ${p.isVeg !== false ? 'green' : 'red'}`} title={p.isVeg !== false ? 'Veg' : 'Non-Veg'}>
                            <span className={p.isVeg !== false ? 'veg-dot-circle' : 'veg-dot-triangle'}></span>
                          </span>
                        </div>
                        <span className="prod-store">
                          {p.store}
                          {shopDistance !== null && (
                            <span style={{ color: 'var(--color-neon-cyan)', fontSize: '11px', marginLeft: '6px' }}>
                              ({shopDistance.toFixed(1)} km)
                            </span>
                          )}
                        </span>
                        <p className="prod-category">{p.category}</p>
                        
                        {(p.originalPrice > p.price || p.offerText) && (
                          <div style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge-warning" style={{ fontSize: '9px', padding: '2px 6px', fontWeight: 'bold' }}>
                              {p.offerText || `SAVE ${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%`}
                            </span>
                          </div>
                        )}

                        <div className="prod-buy">
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span className="prod-price" style={{ color: p.originalPrice > p.price ? 'var(--color-success)' : 'inherit' }}>
                              {formatINR(p.price)}
                            </span>
                            {p.originalPrice > p.price && (
                              <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                                {formatINR(p.originalPrice)}
                              </span>
                            )}
                          </div>
                          <button 
                            className="add-to-cart-btn" 
                            onClick={() => {
                              if (isClosed) {
                                showToast(`We do not deliver at your location. Store is closed.`, 'warning');
                                return;
                              }
                              if (isOutOfRange) {
                                showToast(`We do not deliver at your location.`, 'warning');
                                return;
                              }
                              handleAddToCart(p);
                            }}
                            style={{
                              background: 'var(--color-primary)',
                              color: '#000',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={16} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                             trackedOrder.status?.startsWith('CANCELLED') ? 'Order Cancelled' :
                             trackedOrder.status === 'ASSIGNED' ? 'Arriving in ~10 mins' :
                             trackedOrder.status === 'ACCEPTED' ? 'Preparing... ~10 mins' :
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
                            <span className={`badge ${
                              trackedOrder.status === 'COMPLETED' ? 'badge-success' : 
                              trackedOrder.status?.startsWith('CANCELLED') ? 'badge-danger' : 
                              'badge-warning'
                            }`}>
                              {trackedOrder.status}
                            </span>
                          </div>
                          <div className="sidebar-detail-row">
                            <span>Payment:</span>
                            <span className="badge badge-info">{trackedOrder.paymentMethod}</span>
                          </div>
                        </div>

                        {/* Scan & Pay on Delivery UPI QR code for COD orders */}
                        {trackedOrder.paymentMethod === 'COD' && 
                         !['COMPLETED', 'DELIVERED'].includes(trackedOrder.status?.toUpperCase()) && 
                         !trackedOrder.status?.toUpperCase().startsWith('CANCEL') && (
                          <div className="cod-qr-card border-glow" style={{
                            background: 'rgba(218, 165, 32, 0.04)',
                            border: '1px dashed rgba(218, 165, 32, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            marginTop: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                              💵 Scan & Pay on Delivery
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                              Scan the QR code using any UPI app (GPay, Paytm, PhonePe) to pay the rider digitally on delivery.
                            </p>
                            <div style={{
                              background: '#ffffff',
                              padding: '8px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--color-border)'
                            }}>
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                  `upi://pay?pa=8233816674@upi&pn=PIXIgo%20Delivery&am=${trackedOrder.totalAmount}&cu=INR&tn=PIXIgo%20Order%20${trackedOrder.id}`
                                )}`} 
                                alt="UPI Payment QR Code"
                                style={{ width: '130px', height: '130px', display: 'block' }}
                              />
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffb300' }}>
                              Amount: {formatINR(trackedOrder.totalAmount)}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              background: 'rgba(218, 165, 32, 0.08)',
                              border: '1px solid rgba(218, 165, 32, 0.25)',
                              borderRadius: '24px',
                              padding: '6px 14px',
                              fontSize: '12px'
                            }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ffd700' }}>8233816674@upi</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText('8233816674@upi');
                                  showToast('UPI ID copied to clipboard!', 'success');
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ffd700',
                                  fontWeight: 'bold',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  textTransform: 'uppercase'
                                }}
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}

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
            {adminSubView === 'sales' && (
              !isSalesUnlocked ? (
                <div className="analytics-dashboard-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px', width: '100%' }}>
                  <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ margin: '0 auto 10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={32} style={{ color: '#ef4444' }} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Dashboard Locked</h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      This Sales and Analytics Dashboard contains sensitive financial data and is restricted to Administrators only.
                    </p>
                    {salesPinError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px', borderRadius: '8px', fontSize: '12px' }}>
                        ⚠️ {salesPinError}
                      </div>
                    )}
                    <form onSubmit={handleUnlockSales} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <input 
                          type={showSalesPin ? "text" : "password"} 
                          placeholder="Enter Admin PIN" 
                          value={salesPinInput}
                          onChange={(e) => setSalesPinInput(e.target.value)}
                          style={{ width: '100%', background: 'rgba(15, 23, 42, 0.05)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 40px 10px 14px', color: 'var(--color-text-main)', fontSize: '14px', textAlign: 'center', outline: 'none' }}
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowSalesPin(!showSalesPin)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                          title={showSalesPin ? "Hide PIN" : "Show PIN"}
                        >
                          {showSalesPin ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <button type="submit" className="neon-btn" style={{ width: '100%', padding: '10px' }}>
                        Unlock Dashboard
                      </button>
                    </form>
                  </div>
                </div>
              ) : (() => {
                const analytics = getAnalytics();
                return (
                  <div className="analytics-dashboard-container fade-in">
                    <div className="panel-header">
                      <h2>Sales & Operations Dashboard</h2>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="analytics-badge-pill analytics-badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Activity size={14} /> Real-Time Sync Active
                        </span>
                        <button 
                          onClick={() => {
                            setIsSalesUnlocked(false);
                            sessionStorage.removeItem('pixigo_sales_unlocked');
                          }}
                          className="secondary-btn"
                          style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                        >
                          Lock Dashboard
                        </button>
                      </div>
                    </div>

                    {/* Summary Cards Grid */}
                    <div className="analytics-cards-grid">
                      {/* Today's Sales */}
                      <div className="analytics-card card-grad-primary" onClick={() => setSelectedAnalyticsSalesGroup('today')} style={{ cursor: 'pointer' }}>
                        <div className="analytics-card-title">Today's Gross Sales</div>
                        <div className="analytics-card-value">₹{analytics.todayStats.grossSales}</div>
                        <div className="analytics-card-footer">
                          <span>Orders: {analytics.todayStats.placedCount}</span>
                          <span>Delivered: {analytics.todayStats.completedCount}</span>
                        </div>
                      </div>

                      {/* All-Time Sales */}
                      <div className="analytics-card card-grad-profit" onClick={() => setSelectedAnalyticsSalesGroup('all-time')} style={{ cursor: 'pointer' }}>
                        <div className="analytics-card-title">All-Time Gross Sales</div>
                        <div className="analytics-card-value">₹{analytics.allTimeStats.grossSales}</div>
                        <div className="analytics-card-footer">
                          <span>Total Orders: {analytics.allTimeStats.placedCount}</span>
                          <span>Delivered: {analytics.allTimeStats.completedCount}</span>
                        </div>
                      </div>

                      {/* Net Profit */}
                      <div className="analytics-card card-grad-success">
                        <div className="analytics-card-title">All-Time Net Profit</div>
                        <div className="analytics-card-value">₹{stats.netProfit}</div>
                        <div className="analytics-card-footer">
                          <span>Commission: {commissionPercent}%</span>
                        </div>
                      </div>

                      {/* Cancelled */}
                      <div className="analytics-card card-grad-cancelled" onClick={() => setSelectedAnalyticsSalesGroup('cancelled')} style={{ cursor: 'pointer' }}>
                        <div className="analytics-card-title">Cancelled Orders</div>
                        <div className="analytics-card-value">{analytics.allTimeStats.cancelledCount}</div>
                        <div className="analytics-card-footer">
                          <span>Today's Cancelled: {analytics.todayStats.cancelledCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sales Sub-Tabs Selector */}
                    <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', margin: '20px 0 10px 0', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSalesTab('merchants')}
                        className={`nav-link ${salesTab === 'merchants' ? 'active' : ''}`}
                        style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Store size={15} />
                        Merchant Earnings Summary
                      </button>
                      <button
                        onClick={() => setSalesTab('riders')}
                        className={`nav-link ${salesTab === 'riders' ? 'active' : ''}`}
                        style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Bike size={15} />
                        Rider Payouts Summary
                      </button>
                    </div>

                    {/* Main Render container for Tables */}
                    <div className="analytics-grid-one-col" style={{ width: '100%' }}>
                      {/* Merchant Performance Section */}
                      {salesTab === 'merchants' && (
                        <div className="glass-panel fade-in" style={{ padding: '24px', width: '100%' }}>
                          <div className="analytics-search-row" style={{ marginBottom: '16px' }}>
                            <h3>🏪 Merchant Earnings Overview</h3>
                          </div>
                          <div className="analytics-table-wrapper" style={{ maxHeight: '550px' }}>
                            <table className="analytics-table">
                              <thead>
                                <tr>
                                  <th>Shop Name</th>
                                  <th>Category</th>
                                  <th>Orders</th>
                                  <th>Gross Sales</th>
                                  <th>Net Earnings</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analytics.merchantStats.length === 0 ? (
                                  <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                                      No merchants registered.
                                    </td>
                                  </tr>
                                ) : (
                                  analytics.merchantStats.map(m => (
                                    <tr key={m.id} onClick={() => setSelectedAnalyticsMerchant(m)} className="clickable-row" style={{ cursor: 'pointer' }}>
                                      <td>
                                        <strong>{m.name}</strong>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{m.phone}</div>
                                      </td>
                                      <td>{m.category}</td>
                                      <td>
                                        <span className="analytics-badge-pill analytics-badge-info" style={{ marginRight: '4px' }}>
                                          {m.completedCount} Done
                                        </span>
                                        {m.activeCount > 0 && (
                                          <span className="analytics-badge-pill analytics-badge-warning">
                                            {m.activeCount} Active
                                          </span>
                                        )}
                                      </td>
                                      <td>₹{m.grossSales}</td>
                                      <td>
                                        <strong style={{ color: '#4ade80' }}>₹{m.netEarnings}</strong>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Rider Performance Section */}
                      {salesTab === 'riders' && (
                        <div className="glass-panel fade-in" style={{ padding: '24px', width: '100%' }}>
                          <div className="analytics-search-row" style={{ marginBottom: '16px' }}>
                            <h3> 🛵 Rider Payouts Overview</h3>
                          </div>
                          <div className="analytics-table-wrapper" style={{ maxHeight: '550px' }}>
                            <table className="analytics-table">
                              <thead>
                                <tr>
                                  <th>Rider Name</th>
                                  <th>Vehicle</th>
                                  <th>Completed Runs</th>
                                  <th>Total Payout</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analytics.riderStats.length === 0 ? (
                                  <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                                      No delivery agents registered.
                                    </td>
                                  </tr>
                                ) : (
                                  analytics.riderStats.map(r => (
                                    <tr key={r.id} onClick={() => setSelectedAnalyticsRider(r)} className="clickable-row" style={{ cursor: 'pointer' }}>
                                      <td>
                                        <strong>{r.name}</strong>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{r.phone}</div>
                                      </td>
                                      <td>{r.vehicle}</td>
                                      <td>
                                        <span className="analytics-badge-pill analytics-badge-success">
                                          {r.completedCount} Deliveries
                                        </span>
                                      </td>
                                      <td>
                                        <strong style={{ color: '#fbbf24' }}>₹{r.totalPayout}</strong>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}

            {adminSubView === 'orders' && (<>
              <div className="admin-orders-table glass-panel fade-in">
                <div className="panel-header">
                  <h2>Active Order Operations ({filteredOrders.length})</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px', width: '260px' }}>
                      <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Search orders..." 
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-main)', fontSize: '13px', width: '100%' }}
                      />
                      {adminSearchQuery && (
                        <button onClick={() => setAdminSearchQuery('')} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button className="neon-btn csv-btn" onClick={handleExportCSV}>
                      <Download size={16} /> Export to Excel
                    </button>
                  </div>
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
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                            No active orders match search query.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(o => {
                          const routing = o.routingOption || (['Bake House', 'Grand Plaza Restaurant', 'Sweet Treat Cafe'].includes(o.merchantName) ? 'Option 1 (Shop-Direct)' : 'Option 2 (Managed)');
                          return (
                            <tr 
                              key={o.id}
                              onClick={() => { setSelectedOrderDetails(o); setIsOrderModalOpen(true); }}
                              className="clickable-row"
                            >
                              <td>
                                <strong>{o.id}</strong>
                                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span className={`badge ${routing === 'Option 1 (Shop-Direct)' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '9px', padding: '2px 6px', width: 'fit-content' }}>
                                    {routing}
                                  </span>
                                  <span className={`badge ${
                                    o.status === 'ACCEPTED' ? 'badge-success' :
                                    o.status === 'ASSIGNED' ? 'badge-primary' :
                                    o.status?.startsWith('CANCELLED') ? 'badge-danger' :
                                    'badge-warning'
                                  }`} style={{ fontSize: '9px', padding: '2px 6px', width: 'fit-content' }}>
                                    {(() => {
                                      const statusUpper = o.status?.toUpperCase() || 'PLACED';
                                      if (statusUpper === 'PLACED') return 'ORDER PLACED';
                                      if (statusUpper === 'ACCEPTED') return 'ACCEPTED BY MERCHANT';
                                      if (statusUpper === 'ASSIGNED') return 'ASSIGNED';
                                      if (statusUpper === 'COMPLETED') return 'ORDER DELIVERED';
                                      return statusUpper;
                                    })()}
                                  </span>
                                </div>
                              </td>
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
                                 {o.status === 'CANCELLED_BY_STORE' ? (
                                   <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                                     Rejected by Store
                                   </span>
                                 ) : o.status === 'CANCELLED_BY_ADMIN' || o.status === 'CANCELLED' ? (
                                   <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                                     Cancelled by Admin
                                   </span>
                                 ) : o.status === 'CANCELLED_BY_RIDER' ? (
                                   <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                                     Rejected by Rider
                                   </span>
                                 ) : o.deliveryPartnerName ? (
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
                                          onClick={(e) => e.stopPropagation()}
                                          style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '4px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                          <MessageCircle size={14} />
                                        </a>
                                      );
                                    })()}
                                  </div>
                                ) : o.status === 'PLACED' ? (
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                    Awaiting Confirmation
                                  </span>
                                ) : (
                                  <select 
                                    className="rider-select"
                                    onChange={(e) => handleAdminAssignRider(o.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
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
                                {o.status === 'CANCELLED_BY_STORE' && (
                                  reroutingOrderId === o.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', minWidth: '150px' }} onClick={(e) => e.stopPropagation()}>
                                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-main)', textAlign: 'left' }}>Re-route Settings:</div>
                                      
                                      {/* Store Dropdown */}
                                      <select
                                        value={rerouteSelectedShop}
                                        onChange={(e) => setRerouteSelectedShop(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="rider-select"
                                        style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                                      >
                                        <option value="">Select Shop...</option>
                                        {shops.filter(s => s.verified).map(s => (
                                          <option key={s.id} value={s.id}>{s.storeName || s.name}</option>
                                        ))}
                                      </select>

                                      {/* Rider Dropdown */}
                                      <select
                                        value={rerouteSelectedRider}
                                        onChange={(e) => setRerouteSelectedRider(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="rider-select"
                                        style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                                      >
                                        <option value="">Select Rider (Optional)...</option>
                                        {deliveryPartners.filter(d => d.verified && d.active).map(d => (
                                          <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                      </select>

                                      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                                        <button 
                                          className="neon-btn small-btn" 
                                          onClick={(e) => { e.stopPropagation(); handleAdminSubmitReroute(o.id); }}
                                          style={{ flex: 1, padding: '4px 8px', fontSize: '11px', background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                                        >
                                          Confirm
                                        </button>
                                        <button 
                                          className="neon-btn small-btn" 
                                          onClick={(e) => { e.stopPropagation(); setReroutingOrderId(null); }}
                                          style={{ flex: 1, padding: '4px 8px', fontSize: '11px', background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button 
                                      className="neon-btn small-btn" 
                                      onClick={(e) => { e.stopPropagation(); handleAdminRerouteOrder(o.id); }}
                                      style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                    >
                                      Re-route Order
                                    </button>
                                  )
                                )}
                                {o.status === 'PLACED' && routing === 'Option 2 (Managed)' && (
                                  <button className="neon-btn small-btn" onClick={(e) => { e.stopPropagation(); handleAdminAcceptOrder(o.id); }}>
                                    Confirm Order
                                  </button>
                                )}
                                {o.status === 'PLACED' && routing === 'Option 1 (Shop-Direct)' && (
                                  <span style={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: '600' }}>
                                    Awaiting Merchant...
                                  </span>
                                )}
                                <a 
                                  href={`https://wa.me/${o.customerPhone}?text=Hi%20${o.customerName},%20your%20PixiGo%20Order%20from%20${o.items[0]?.store}%20is%20assigned.%20Your%20delivery%20OTP%20is%20${o.otp}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="whatsapp-link-btn"
                                  title="WhatsApp Customer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MessageCircle size={18} />
                                </a>
                              </td>
                            </tr>
                          );
                        })
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
                          orders.filter(o => o.status === 'COMPLETED').map(o => {
                            const routing = o.routingOption || (['Bake House', 'Grand Plaza Restaurant', 'Sweet Treat Cafe'].includes(o.merchantName) ? 'Option 1 (Shop-Direct)' : 'Option 2 (Managed)');
                            return (
                              <tr key={o.id}>
                                <td>
                                  <strong>{o.id}</strong>
                                  <div style={{ marginTop: '4px' }}>
                                    <span className={`badge ${routing === 'Option 1 (Shop-Direct)' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                                      {routing}
                                    </span>
                                  </div>
                                </td>
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
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>)}

            {adminSubView === 'items' && (
              <div className="admin-orders-table glass-panel fade-in">
                <div className="panel-header">
                  <h2>Product Catalog Manager ({filteredAdminProducts.length})</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px', width: '260px' }}>
                      <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-main)', fontSize: '13px', width: '100%' }}
                      />
                      {adminSearchQuery && (
                        <button onClick={() => setAdminSearchQuery('')} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button 
                      className="neon-btn" 
                      onClick={() => setIsAdminAddFormOpen(!isAdminAddFormOpen)} 
                      style={{ background: 'rgba(0, 255, 242, 0.1)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                    >
                      {isAdminAddFormOpen ? '✖ Close Form' : '➕ Add Product'}
                    </button>
                    <button className="neon-btn csv-btn" onClick={() => { setAdminSubView('orders'); setAdminSearchQuery(''); }}>
                      ← Back to Orders
                    </button>
                  </div>
                </div>

                {/* Togglable Admin Add Product Form */}
                {isAdminAddFormOpen && (
                  <div className="glass-panel fade-in border-glow" style={{ padding: '24px', marginBottom: '24px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.4)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--color-primary)', textAlign: 'left' }}>➕ Add New Product to Catalog</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Product Name</label>
                        <input 
                          type="text" 
                          value={adminNewProductName} 
                          onChange={(e) => setAdminNewProductName(e.target.value)} 
                          className="custom-input" 
                          placeholder="e.g. Chocolate Truffle Cake"
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Price (₹)</label>
                        <input 
                          type="number" 
                          value={adminNewProductPrice} 
                          onChange={(e) => setAdminNewProductPrice(e.target.value)} 
                          className="custom-input" 
                          placeholder="e.g. 350"
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Original Price (₹)</label>
                        <input 
                          type="number" 
                          value={adminNewProductOrigPrice} 
                          onChange={(e) => setAdminNewProductOrigPrice(e.target.value)} 
                          className="custom-input" 
                          placeholder="e.g. 400"
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Offer Title</label>
                        <input 
                          type="text" 
                          value={adminNewProductOffer} 
                          onChange={(e) => setAdminNewProductOffer(e.target.value)} 
                          className="custom-input" 
                          placeholder="e.g. 15% OFF"
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Image URL / Emoji</label>
                        <input 
                          type="text" 
                          value={adminNewProductImage} 
                          onChange={(e) => setAdminNewProductImage(e.target.value)} 
                          className="custom-input" 
                          placeholder="https://... or 🍰"
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Dietary Type</label>
                        <select 
                          value={adminNewProductIsVeg ? 'veg' : 'nonveg'} 
                          onChange={(e) => setAdminNewProductIsVeg(e.target.value === 'veg')}
                          className="rider-select"
                          style={{ height: '38px' }}
                        >
                          <option value="veg">🟢 Vegetarian</option>
                          <option value="nonveg">🔴 Non-Vegetarian</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Product Category</label>
                        <select 
                          value={adminNewProductCategory} 
                          onChange={(e) => setAdminNewProductCategory(e.target.value)}
                          className="rider-select"
                          style={{ height: '38px' }}
                        >
                          {categories.slice(1).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="custom">[+ Custom Category]</option>
                        </select>
                        {adminNewProductCategory === 'custom' && (
                          <input 
                            type="text"
                            value={adminCustomCategory}
                            onChange={(e) => setAdminCustomCategory(e.target.value)}
                            className="custom-input"
                            style={{ marginTop: '8px' }}
                            placeholder="Enter Custom Category"
                          />
                        )}
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Representing Shop</label>
                        <select 
                          value={adminNewProductStore} 
                          onChange={(e) => setAdminNewProductStore(e.target.value)}
                          className="rider-select"
                          style={{ height: '38px' }}
                        >
                          <option value="">-- Select Shop --</option>
                          {shops.map(s => (
                            <option key={s.id} value={s.storeName || s.name}>{s.storeName || s.name}</option>
                          ))}
                          <option value="custom">[+ Custom Shop]</option>
                        </select>
                        {adminNewProductStore === 'custom' && (
                          <input 
                            type="text"
                            value={adminCustomStore}
                            onChange={(e) => setAdminCustomStore(e.target.value)}
                            className="custom-input"
                            style={{ marginTop: '8px' }}
                            placeholder="Enter Custom Shop Name"
                          />
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button 
                        className="neon-btn" 
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid var(--color-border)' }} 
                        onClick={() => setIsAdminAddFormOpen(false)}
                      >
                        Cancel
                      </button>
                      <button className="neon-btn" onClick={handleAdminAddProduct}>
                        Create & Publish Item
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="table-responsive">
                  <table className="order-log-table">
                    <thead>
                      <tr>
                        <th>Item Info</th>
                        <th>Store</th>
                        <th>Category</th>
                        <th>Image URL</th>
                        <th>Selling Price (₹)</th>
                        <th>Original Price (₹)</th>
                        <th>Offer Title</th>
                        <th>Final Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdminProducts.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                            No products match search query.
                          </td>
                        </tr>
                      ) : (
                        filteredAdminProducts.map(p => {
                          return (
                            <tr key={p.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ fontSize: '20px' }}>{p.emoji || '📦'}</div>
                                  <div style={{ textAlign: 'left' }}>
                                    <strong>{p.name}</strong>
                                    <div className="sub-text">ID: {p.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{p.store}</td>
                              <td>
                                <span className="badge badge-info">{p.category}</span>
                              </td>
                              <td>
                                <input 
                                  type="text"
                                  id={`image-${p.id}`}
                                  defaultValue={p.image || ''}
                                  placeholder="Image URL"
                                  className="rider-select"
                                  style={{ width: '150px', padding: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '11px' }}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number"
                                  id={`price-${p.id}`}
                                  defaultValue={p.price}
                                  className="rider-select"
                                  style={{ width: '80px', padding: '4px', background: 'rgba(255,255,255,0.05)' }}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number"
                                  id={`orig-price-${p.id}`}
                                  defaultValue={p.originalPrice || 0}
                                  placeholder="0"
                                  className="rider-select"
                                  style={{ width: '80px', padding: '4px', background: 'rgba(255,255,255,0.05)' }}
                                />
                              </td>
                              <td>
                                <input 
                                  type="text"
                                  id={`offer-${p.id}`}
                                  defaultValue={p.offerText || ''}
                                  placeholder="e.g. 20% Off"
                                  className="rider-select"
                                  style={{ width: '150px', padding: '4px', background: 'rgba(255,255,255,0.05)' }}
                                />
                              </td>
                              <td>
                                <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                                  {formatINR(p.price)}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="neon-btn small-btn"
                                    onClick={() => {
                                      const priceInput = document.getElementById(`price-${p.id}`);
                                      const origPriceInput = document.getElementById(`orig-price-${p.id}`);
                                      const offerInput = document.getElementById(`offer-${p.id}`);
                                      const imageInput = document.getElementById(`image-${p.id}`);
                                      handleAdminUpdateProductCatalog(
                                        p.id, 
                                        priceInput.value, 
                                        origPriceInput.value, 
                                        offerInput.value,
                                        imageInput.value
                                      );
                                    }}
                                    style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)', padding: '4px 10px' }}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    className="neon-btn small-btn"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                        handleMerchantDeleteProduct(p.id);
                                      }
                                    }}
                                    style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '4px 10px' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminSubView === 'shops' && (
              <>
                <div className="admin-riders-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
                  <div className="admin-orders-table glass-panel fade-in" style={{ margin: 0 }}>
                    <div className="panel-header">
                      <h2>Registered Shops Directory ({filteredShops.length})</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px', width: '260px' }}>
                          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                          <input 
                            type="text" 
                            placeholder="Search shops..." 
                            value={adminSearchQuery}
                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-main)', fontSize: '13px', width: '100%' }}
                          />
                          {adminSearchQuery && (
                            <button onClick={() => setAdminSearchQuery('')} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <button className="neon-btn csv-btn" onClick={() => { setAdminSubView('orders'); setAdminSearchQuery(''); }}>
                          ← Back to Orders
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="order-log-table">
                        <thead>
                          <tr>
                            <th>Shop ID</th>
                            <th>Shop Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredShops.length === 0 ? (
                            <tr>
                              <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                                No shops match search query.
                              </td>
                            </tr>
                          ) : (
                            filteredShops.map(s => (
                            <tr 
                              key={s.id} 
                              onClick={() => handleOpenShopDetails(s)}
                              className="clickable-row"
                            >
                              <td><strong>{s.id}</strong></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span>
                                    {s.name}
                                    {s.hasAuthAccount && <span style={{ marginLeft: '6px', color: 'var(--color-primary)', cursor: 'help' }} title="Firebase Auth account created">🔑</span>}
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--color-neon-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', paddingRight: '8px' }}>
                                    View Details →
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )))}
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
                      <h2>Registered Riders Directory ({filteredRiders.length})</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px', width: '260px' }}>
                          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                          <input 
                            type="text" 
                            placeholder="Search riders..." 
                            value={adminSearchQuery}
                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-main)', fontSize: '13px', width: '100%' }}
                          />
                          {adminSearchQuery && (
                            <button onClick={() => setAdminSearchQuery('')} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <button className="neon-btn csv-btn" onClick={() => { setAdminSubView('orders'); setAdminSearchQuery(''); }}>
                          ← Back to Orders
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="order-log-table">
                        <thead>
                          <tr>
                            <th>Rider ID</th>
                            <th>Rider Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRiders.length === 0 ? (
                            <tr>
                              <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                                No riders match search query.
                              </td>
                            </tr>
                          ) : (
                            filteredRiders.map(d => (
                            <tr 
                              key={d.id}
                              onClick={() => handleStartEditRider(d)}
                              className="clickable-row"
                            >
                              <td><strong>{d.id}</strong></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span>
                                    {d.name}
                                    {d.hasAuthAccount && <span style={{ marginLeft: '6px', color: 'var(--color-primary)', cursor: 'help' }} title="Firebase Auth account created">🔑</span>}
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--color-neon-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', paddingRight: '8px' }}>
                                    View Details →
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )))}
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

                  {/* Panel 2b: System Announcements Configuration */}
                  <div className={`settings-accordion-section ${activeSettingsAccordion === 'announcement' ? 'active' : ''}`} style={{ marginTop: '20px' }}>
                    <button 
                      type="button" 
                      className="settings-accordion-header"
                      onClick={() => {
                        setActiveSettingsAccordion(activeSettingsAccordion === 'announcement' ? '' : 'announcement');
                      }}
                    >
                      <h2>
                        <FileText size={20} style={{ color: 'var(--color-primary)' }} />
                        <span>System Announcement Banners</span>
                      </h2>
                      <ChevronDown size={20} className="accordion-chevron" />
                    </button>
                    
                    <div className="settings-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Customer Banner Settings */}
                      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffd700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          ⭐ Customer Storefront Announcement (Black & Gold Theme)
                        </h3>
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Marquee Message</label>
                          <textarea 
                            value={customerAnnouncementEdit} 
                            onChange={(e) => setCustomerAnnouncementEdit(e.target.value)} 
                            className="custom-input"
                            placeholder="e.g. 🎉 Special Offer: Use code FIRST20 to get flat 20% discount on your first order! | Free delivery on orders above ₹500!"
                            rows={2}
                            style={{ width: '100%', height: '60px', padding: '8px', resize: 'vertical' }}
                          />
                        </div>
                        <button className="neon-btn" onClick={handleSaveCustomerAnnouncement} style={{ alignSelf: 'flex-start', padding: '8px 20px', width: '100%' }}>
                          Save Customer Announcement Settings
                        </button>
                      </div>

                      {/* Rider Banner Settings */}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#00fff2', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          📢 Rider Portal Announcement (Neon Cyan Theme)
                        </h3>
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Marquee Message</label>
                          <textarea 
                            value={riderAnnouncementEdit} 
                            onChange={(e) => setRiderAnnouncementEdit(e.target.value)} 
                            className="custom-input"
                            placeholder="e.g. 📢 Welcome to PIXIgo Rider Console! Please keep your GPS enabled and update delivery status with OTP on successful delivery."
                            rows={2}
                            style={{ width: '100%', height: '60px', padding: '8px', resize: 'vertical' }}
                          />
                        </div>
                        <button className="neon-btn" onClick={handleSaveRiderAnnouncement} style={{ alignSelf: 'flex-start', padding: '8px 20px', width: '100%' }}>
                          Save Rider Announcement Settings
                        </button>
                      </div>
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
                            background: 'linear-gradient(135deg, #090d16 0%, #151b2d 100%)',
                            border: '1px solid rgba(0, 255, 242, 0.25)',
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
                              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px 0', lineHeight: '1.4' }}>{dealTextEdit || 'Belgian Chocolate Waffle - Sweet Treat Cafe - Flat 20% Off!'}</h3>
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
                              background: 'linear-gradient(135deg, #090d16 0%, #151b2d 100%)',
                              border: '1px solid rgba(0, 255, 242, 0.25)',
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
                                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px 0', lineHeight: '1.4' }}>{dealTextEdit || 'Belgian Chocolate Waffle - Sweet Treat Cafe - Flat 20% Off!'}</h3>
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

            {adminSubView === 'users' && (
              <div className="admin-orders-table glass-panel fade-in">
                <div className="panel-header">
                  <h2>Platform Users Directory ({filteredUsers.length})</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px', width: '260px' }}>
                      <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-main)', fontSize: '13px', width: '100%' }}
                      />
                      {adminSearchQuery && (
                        <button onClick={() => setAdminSearchQuery('')} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button className="neon-btn csv-btn" onClick={() => { setAdminSubView('orders'); setAdminSearchQuery(''); }}>
                      ← Back to Orders
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="order-log-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Name / Username</th>
                        <th>Email Address</th>
                        <th>Role / Account Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                            No users match search query.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => {
                          const roleBadgeClass = 
                            u.role === 'admin' ? 'badge-danger' : 
                            u.role === 'merchant' ? 'badge-warning' : 
                            u.role === 'rider' ? 'badge-primary' : 
                            'badge-success';
                          
                          const roleLabel = 
                            u.role === 'admin' ? 'Admin' : 
                            u.role === 'merchant' ? 'Merchant' : 
                            u.role === 'rider' ? 'Delivery Partner' : 
                            'Customer';

                          return (
                            <tr key={u.id}>
                              <td><strong style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{u.id}</strong></td>
                              <td><strong>{u.name}</strong></td>
                              <td>{u.email}</td>
                              <td>
                                <span className={`badge ${roleBadgeClass}`}>
                                  {roleLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
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
          
          const activeJobs = orders.filter(o => o.deliveryPartnerId === user?.uid && o.status !== 'COMPLETED' && !o.status?.startsWith('CANCELLED'));
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
                
                {/* Rider Portal Announcement Marquee Banner */}
                {riderAnnouncement && (
                  <div className="rider-announcement-banner" style={{
                    marginBottom: '24px',
                    padding: '8px 16px',
                    background: 'rgba(0, 255, 242, 0.05)',
                    border: '1px solid rgba(0, 255, 242, 0.15)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 0 10px rgba(0, 255, 242, 0.05)'
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '800', 
                      color: 'var(--color-primary)', 
                      background: 'rgba(0, 255, 242, 0.15)', 
                      padding: '4px 10px', 
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      📢 Notice
                    </span>
                    <marquee 
                      behavior="scroll" 
                      direction="left" 
                      scrollamount="4" 
                      style={{ 
                        fontSize: '13px', 
                        color: '#00fff2', 
                        textShadow: '0 0 4px rgba(0, 255, 242, 0.3)',
                        fontWeight: '600', 
                        margin: 0,
                        padding: 0
                      }}
                    >
                      {riderAnnouncement}
                    </marquee>
                  </div>
                )}

                {/* Rider Welcome Info */}
                <div style={{ textAlign: 'left', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                    Welcome, {user?.name || user?.email}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Logged in as: <strong>{user?.email}</strong> | UID: <strong>{user?.uid}</strong>
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

                {/* Available Delivery Jobs Pool */}
                <div className="rider-orders-section" style={{ marginBottom: '32px' }}>
                  <h2>Available Delivery Jobs Pool ({availablePoolJobs.length})</h2>
                  {availablePoolJobs.length === 0 ? (
                    <div className="no-jobs-card">
                      <Package size={32} className="text-muted" />
                      <p>No available delivery runs in the pool at the moment.</p>
                    </div>
                  ) : (
                    availablePoolJobs.map(o => (
                      <div key={o.id} className="job-card glass-panel" style={{ marginBottom: '20px', border: '1px solid var(--color-primary-glow-strong)' }}>
                        <div className="job-header">
                          <div style={{ textAlign: 'left' }}>
                            <h3 style={{ margin: 0 }}>Order {o.id}</h3>
                            <span className="badge badge-success" style={{ marginTop: '4px', display: 'inline-block' }}>READY FOR PICKUP</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Your Earning</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                              {formatINR(o.riderPayout !== undefined ? o.riderPayout : o.deliveryCharge || 0)}
                            </div>
                          </div>
                        </div>

                        <div className="job-info-grid">
                          <div className="job-meta-box" style={{ textAlign: 'left' }}>
                            <h4>🏪 Merchant Pickup</h4>
                            <p><strong>Shop:</strong> {o.merchantName || o.items[0]?.store}</p>
                            <p><strong>Location:</strong> Vaishali Market Area, Jaipur</p>
                          </div>

                          <div className="job-meta-box" style={{ textAlign: 'left' }}>
                            <h4>🏠 Customer Delivery</h4>
                            <p><strong>Address:</strong> {o.customerLocation}</p>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.customerLocation)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="maps-link-btn"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '4px 0 8px 0', fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none' }}
                            >
                              📍 View on Google Maps
                            </a>
                            <p><strong>Payment Method:</strong> {o.paymentMethod} {o.paymentMethod === 'COD' ? `(${formatINR(o.totalAmount)} to collect)` : '(Paid Online)'}</p>
                          </div>
                        </div>

                        <div className="rider-tracking-controls" style={{ marginTop: '16px' }}>
                          <button 
                            className="neon-btn" 
                            style={{ width: '100%', background: 'var(--color-primary)', color: '#000000', fontWeight: 'bold' }}
                            onClick={() => handleRiderAcceptJob(o.id)}
                          >
                            🤝 Claim & Accept Delivery Run
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
                              {formatINR(o.riderPayout !== undefined ? o.riderPayout : o.deliveryCharge || 0)}
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
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.customerLocation)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="maps-link-btn"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '4px 0 8px 0', fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none' }}
                            >
                              📍 View on Google Maps
                            </a>
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
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button 
                              className="neon-btn" 
                              onClick={() => handleRiderCompleteDelivery(o.id)}
                              style={{ flexGrow: 2 }}
                            >
                              Complete Delivery & Collect Cash
                            </button>
                            <button 
                              className="neon-btn" 
                              onClick={() => setActiveQrModalOrder(o)}
                              style={{ flexGrow: 1, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Show QR Code"
                            >
                              📱 Show QR
                            </button>
                          </div>
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
                              +{formatINR(o.riderPayout !== undefined ? o.riderPayout : o.deliveryCharge || 0)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Support Section */}
                <div className="support-section glass-panel border-glow" style={{
                  marginTop: '40px',
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 242, 0.05) 0%, rgba(255, 0, 127, 0.05) 100%)',
                  textAlign: 'left'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                    <MessageCircle size={20} style={{ color: 'var(--color-primary)' }} /> Contact Support Desk
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-main)', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                    You can call us on this number for 24/7 help: <strong><a href="tel:+919251054064" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>+91 9251054064</a></strong>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', width: '100%' }}>
                    <a 
                      href="https://wa.me/919251054064" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="contact-method-card border-glow"
                      style={{ margin: 0 }}
                    >
                      <div className="contact-method-icon whatsapp-color">
                        <MessageCircle size={20} />
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
                      style={{ margin: 0 }}
                    >
                      <div className="contact-method-icon email-color">
                        <Mail size={20} />
                      </div>
                      <div className="contact-method-details">
                        <h4>Email Support</h4>
                        <p>pixigodelivery@gmail.com</p>
                      </div>
                      <ArrowRight size={16} className="contact-arrow" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          );
        })())}

        {/* ==================== MERCHANT DASHBOARD ==================== */}
        {activeTab === 'merchant' && renderPortalGuard('Merchant Dashboard', (() => {
          const merchantOrders = orders.filter(o => {
            const routing = o.routingOption || (['Bake House', 'Grand Plaza Restaurant', 'Sweet Treat Cafe'].includes(o.merchantName) ? 'Option 1 (Shop-Direct)' : 'Option 2 (Managed)');
            return (o.merchantName === currentMerchantShopName || 
                    (o.items && o.items.some(i => i.store === currentMerchantShopName))) &&
                   routing === 'Option 1 (Shop-Direct)';
          });

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
                  {(() => {
                    const matchedShop = loggedInMerchantShop || shops.find(s => s.name === currentMerchantShopName || s.storeName === currentMerchantShopName);
                    if (!matchedShop) return null;
                    return (
                      <div className="glass-panel" style={{
                        marginTop: '16px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: matchedShop.isAcceptingOrders !== false ? 'rgba(104, 166, 0, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid ' + (matchedShop.isAcceptingOrders !== false ? 'rgba(104, 166, 0, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                        borderRadius: '8px'
                      }}>
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: matchedShop.isAcceptingOrders !== false ? 'var(--color-success)' : 'var(--color-danger)',
                              boxShadow: '0 0 8px ' + (matchedShop.isAcceptingOrders !== false ? 'var(--color-success)' : 'var(--color-danger)')
                            }}></span>
                            Order Acceptance Status: <strong>{matchedShop.isAcceptingOrders !== false ? 'OPEN' : 'CLOSED'}</strong>
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {matchedShop.isAcceptingOrders !== false 
                              ? `Your shop is open and actively accepting orders from customers (Hours: ${matchedShop.openTime || '09:00'} - ${matchedShop.closeTime || '22:00'}).` 
                              : 'Your shop is currently closed. Customers cannot place new orders.'}
                          </p>
                        </div>
                        <button 
                          className="neon-btn"
                          onClick={() => handleToggleAcceptingOrders(matchedShop, matchedShop.isAcceptingOrders !== false)}
                          style={{
                            background: matchedShop.isAcceptingOrders !== false ? 'var(--color-danger)' : 'var(--color-success)',
                            borderColor: matchedShop.isAcceptingOrders !== false ? 'var(--color-danger)' : 'var(--color-success)',
                            color: '#fff',
                            fontWeight: 'bold',
                            padding: '8px 16px'
                          }}
                        >
                          {matchedShop.isAcceptingOrders !== false ? 'Close Shop' : 'Open Shop'}
                        </button>
                      </div>
                    );
                  })()}
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
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="neon-btn small-btn" 
                                onClick={() => handleMerchantAcceptOrder(o.id)}
                                style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                              >
                                Approve
                              </button>
                              <button 
                                className="neon-btn small-btn" 
                                onClick={() => handleMerchantRejectOrder(o.id)}
                                style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                              >
                                Cancel
                              </button>
                            </div>
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
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-main)' }}>
                              <strong>Items:</strong> {o.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                            </div>
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
                      <label>Dietary Type</label>
                      <select 
                        value={newProductIsVeg ? 'veg' : 'nonveg'} 
                        onChange={(e) => setNewProductIsVeg(e.target.value === 'veg')}
                        className="rider-select"
                      >
                        <option value="veg">🟢 Vegetarian</option>
                        <option value="nonveg">🔴 Non-Vegetarian</option>
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

                {/* Contact Support Section */}
                <div className="support-section glass-panel border-glow" style={{
                  marginTop: '40px',
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 242, 0.05) 0%, rgba(255, 0, 127, 0.05) 100%)',
                  textAlign: 'left'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                    <MessageCircle size={20} style={{ color: 'var(--color-primary)' }} /> Contact Support Desk
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-main)', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                    You can call us on this number for 24/7 help: <strong><a href="tel:+919251054064" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>+91 9251054064</a></strong>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', width: '100%' }}>
                    <a 
                      href="https://wa.me/919251054064" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="contact-method-card border-glow"
                      style={{ margin: 0 }}
                    >
                      <div className="contact-method-icon whatsapp-color">
                        <MessageCircle size={20} />
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
                      style={{ margin: 0 }}
                    >
                      <div className="contact-method-icon email-color">
                        <Mail size={20} />
                      </div>
                      <div className="contact-method-details">
                        <h4>Email Support</h4>
                        <p>pixigodelivery@gmail.com</p>
                      </div>
                      <ArrowRight size={16} className="contact-arrow" />
                    </a>
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
          <div className="customer-auth-modal-scene" onClick={(e) => e.stopPropagation()}>
            <div className="portal-bg-orbs">
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>
            </div>
            <div className="portal-auth-card-dark customer-auth-modal-card">
              <div className="portal-card-glow-ring"></div>
              <button className="modal-close-btn-dark" onClick={() => { setIsAuthModalOpen(false); setAuthError(''); }}>
                <X size={20} />
              </button>
            
              <div className="auth-icon-badge-dark">
                <User size={36} className="auth-icon-svg" />
              </div>
            
              <div className="auth-modal-header" style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 className="auth-portal-title-dark">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                <p className="auth-portal-subtitle-dark">Access your PixiGo Delivery dashboard</p>
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

            <div className="chittortech-branding-footer-dark">
              <span className="branding-text-muted-dark">Powered and maintained by</span>
              <div className="chittortech-logo-premium">
                <img src="/chittortech_logo.png" alt="Chittortech Logo" className="chittortech-logo-img" />
              </div>
            </div>
            </div>
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
                  style={{ marginTop: '8px' }}
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

              const getStatusStepIndex = (status) => {
                const s = status?.toUpperCase() || '';
                if (s === 'COMPLETED' || s === 'DELIVERED') return 4;
                if (['ASSIGNED', 'PICKED_UP', 'STARTED', 'OUT_FOR_DELIVERY'].includes(s)) return 3;
                if (s === 'ACCEPTED') return 2;
                return 1;
              };

              return (
                <div className="tracked-order-detail-sidebar fade-in" style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>
                  {/* ETA banner */}
                  <div className="eta-banner-sidebar">
                    <span className="eta-countdown-sidebar" style={{ color: trackedOrder.status?.startsWith('CANCELLED') ? 'var(--color-danger)' : 'inherit' }}>
                      {trackedOrder.status === 'COMPLETED' ? 'Delivered successfully!' : 
                       trackedOrder.status === 'CANCELLED_BY_STORE' ? 'Cancelled by the Store' :
                       trackedOrder.status === 'CANCELLED_BY_RIDER' ? 'Cancelled by the Rider' :
                       trackedOrder.status === 'CANCELLED' || trackedOrder.status === 'CANCELLED_BY_ADMIN' ? 'Cancelled by Admin' :
                       trackedOrder.status === 'ASSIGNED' ? 'Arriving in ~10 mins' :
                       trackedOrder.status === 'ACCEPTED' ? 'Preparing... ~10 mins' :
                       'Awaiting Confirmation'}
                    </span>
                  </div>

                  {/* Vertical Timeline Status Progress */}
                  {!trackedOrder.status?.startsWith('CANCELLED') && (
                    <div className="order-progress-timeline">
                      {/* Step 1: Placed */}
                      <div className={`timeline-step ${getStatusStepIndex(trackedOrder.status) >= 1 ? 'completed' : ''} ${getStatusStepIndex(trackedOrder.status) === 1 ? 'active' : ''}`}>
                        <div className="timeline-node">
                          <span className="node-icon">🛒</span>
                        </div>
                        <div className="timeline-content">
                          <h4>Order Placed</h4>
                          <p>We've received your order.</p>
                        </div>
                      </div>
                      
                      <div className="timeline-line-connector">
                        <div className={`timeline-line-progress ${getStatusStepIndex(trackedOrder.status) >= 2 ? 'full' : ''}`}></div>
                      </div>

                      {/* Step 2: Accepted */}
                      <div className={`timeline-step ${getStatusStepIndex(trackedOrder.status) >= 2 ? 'completed' : ''} ${getStatusStepIndex(trackedOrder.status) === 2 ? 'active' : ''}`}>
                        <div className="timeline-node">
                          <span className="node-icon">🍳</span>
                        </div>
                        <div className="timeline-content">
                          <h4>Accepted & Preparing</h4>
                          <p>{getStatusStepIndex(trackedOrder.status) >= 2 ? "Kitchen is preparing your order!" : "Awaiting shop confirmation."}</p>
                        </div>
                      </div>

                      <div className="timeline-line-connector">
                        <div className={`timeline-line-progress ${getStatusStepIndex(trackedOrder.status) >= 3 ? 'full' : ''}`}></div>
                      </div>

                      {/* Step 3: Assigned */}
                      <div className={`timeline-step ${getStatusStepIndex(trackedOrder.status) >= 3 ? 'completed' : ''} ${getStatusStepIndex(trackedOrder.status) === 3 ? 'active' : ''}`}>
                        <div className="timeline-node">
                          <span className="node-icon">🛵</span>
                        </div>
                        <div className="timeline-content">
                          <h4>Courier Dispatched</h4>
                          <p>
                            {getStatusStepIndex(trackedOrder.status) >= 3 
                              ? `Rider ${trackedOrder.deliveryPartnerName || 'Partner'} claimed your run!` 
                              : "Waiting to assign courier..."}
                          </p>
                        </div>
                      </div>

                      <div className="timeline-line-connector">
                        <div className={`timeline-line-progress ${getStatusStepIndex(trackedOrder.status) >= 4 ? 'full' : ''}`}></div>
                      </div>

                      {/* Step 4: Completed */}
                      <div className={`timeline-step ${getStatusStepIndex(trackedOrder.status) >= 4 ? 'completed' : ''} ${getStatusStepIndex(trackedOrder.status) === 4 ? 'active' : ''}`}>
                        <div className="timeline-node">
                          <span className="node-icon">🎉</span>
                        </div>
                        <div className="timeline-content">
                          <h4>Delivered</h4>
                          <p>{getStatusStepIndex(trackedOrder.status) >= 4 ? "Enjoy your delivery! Thank you." : "Delivery completion pending."}</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <span className={`badge ${
                        trackedOrder.status === 'COMPLETED' ? 'badge-success' : 
                        trackedOrder.status?.startsWith('CANCELLED') ? 'badge-danger' : 
                        'badge-warning'
                      }`}>
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

                  {/* Scan & Pay on Delivery UPI QR code for COD orders */}
                  {trackedOrder.paymentMethod === 'COD' && 
                   !['COMPLETED', 'DELIVERED'].includes(trackedOrder.status?.toUpperCase()) && 
                   !trackedOrder.status?.toUpperCase().startsWith('CANCEL') && (
                    <div className="cod-qr-card border-glow" style={{
                      background: 'rgba(218, 165, 32, 0.04)',
                      border: '1px dashed rgba(218, 165, 32, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        💵 Scan & Pay on Delivery
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                        Scan the QR code using any UPI app (GPay, Paytm, PhonePe) to pay the rider digitally on delivery.
                      </p>
                      <div style={{
                        background: '#ffffff',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--color-border)'
                      }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            `upi://pay?pa=8233816674@upi&pn=PIXIgo%20Delivery&am=${trackedOrder.totalAmount}&cu=INR&tn=PIXIgo%20Order%20${trackedOrder.id}`
                          )}`} 
                          alt="UPI Payment QR Code"
                          style={{ width: '130px', height: '130px', display: 'block' }}
                        />
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffb300' }}>
                        Amount: {formatINR(trackedOrder.totalAmount)}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        background: 'rgba(218, 165, 32, 0.08)',
                        border: '1px solid rgba(218, 165, 32, 0.25)',
                        borderRadius: '24px',
                        padding: '6px 14px',
                        fontSize: '12px'
                      }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ffd700' }}>8233816674@upi</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('8233816674@upi');
                            showToast('UPI ID copied to clipboard!', 'success');
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffd700',
                            fontWeight: 'bold',
                            fontSize: '10px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rider Information Panel */}
                  {trackedOrder.deliveryPartnerId ? (() => {
                    const riderPhone = deliveryPartners.find(d => d.id === trackedOrder.deliveryPartnerId)?.phone || trackedOrder.deliveryPartnerPhone || '9251054064';
                    return (
                      <div className="rider-card-sidebar border-glow" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div className="rider-avatar-sidebar">🛵</div>
                          <div className="rider-desc-sidebar" style={{ textAlign: 'left' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>{trackedOrder.deliveryPartnerName}</h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              Vehicle: {deliveryPartners.find(d => d.id === trackedOrder.deliveryPartnerId)?.vehicle.split(' (')[0] || '🛵'}
                            </p>
                          </div>
                          <div className="otp-badge-sidebar">
                            <span>OTP: <strong>{trackedOrder.otp}</strong></span>
                          </div>
                        </div>
                        {riderPhone && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '500' }}>📞 {riderPhone}</span>
                            <a 
                              href={`tel:${riderPhone}`} 
                              className="neon-btn" 
                              style={{ padding: '6px 12px', fontSize: '11px', textDecoration: 'none', background: 'var(--color-primary)', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#000000', fontWeight: 'bold', boxShadow: 'none' }}
                            >
                              <Phone size={11} /> Call Rider
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
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

              <div className="divider" style={{ margin: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <span style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 'bold' }}>🔐 Firebase Auth Credentials</span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Register this rider's login account in Firebase Auth.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <button 
                    type="button" 
                    className="neon-btn small-btn" 
                    onClick={() => handleCreateAuthAccount('rider', editRiderEmail || editingRider.name, editRiderPassword || editingRider.password, editingRider.id)}
                    style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(104, 166, 0, 0.1)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', alignSelf: 'flex-start' }}
                  >
                    Register Rider Login in Firebase
                  </button>
                </div>
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>GPS Location:</span>
                <input 
                  type="number"
                  step="0.000001"
                  placeholder="Lat (e.g. 24.8887)"
                  value={shopDocLat}
                  onChange={(e) => setShopDocLat(e.target.value)}
                  className="custom-input-premium"
                  style={{ padding: '6px 8px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', width: '100%' }}
                />
                <input 
                  type="number"
                  step="0.000001"
                  placeholder="Lng (e.g. 74.6269)"
                  value={shopDocLng}
                  onChange={(e) => setShopDocLng(e.target.value)}
                  className="custom-input-premium"
                  style={{ padding: '6px 8px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', alignItems: 'center' }}>
                <span></span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    className="neon-btn small-btn"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setShopDocLat(position.coords.latitude.toFixed(6));
                            setShopDocLng(position.coords.longitude.toFixed(6));
                            showToast("Shop location auto-detected!");
                          },
                          (error) => {
                            console.error("Geolocation failed:", error);
                            alert("Could not detect location. Please check browser permissions.");
                          }
                        );
                      } else {
                        alert("Geolocation is not supported by your browser.");
                      }
                    }}
                    style={{ padding: '6px 10px', fontSize: '11px', flex: 1, whiteSpace: 'nowrap' }}
                  >
                    🎯 Detect My GPS
                  </button>
                  <button
                    type="button"
                    className="neon-btn small-btn"
                    onClick={async () => {
                      const address = selectedShopDetails.address || selectedShopDetails.storeName || selectedShopDetails.name;
                      if (!address) {
                        alert("Shop address is empty! Please verify shop details.");
                        return;
                      }
                      try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
                        const data = await response.json();
                        if (data && data.length > 0) {
                          setShopDocLat(parseFloat(data[0].lat).toFixed(6));
                          setShopDocLng(parseFloat(data[0].lon).toFixed(6));
                          showToast("Coordinates found from address!");
                        } else {
                          const retryResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Chittorgarh")}&limit=1`);
                          const retryData = await retryResponse.json();
                          if (retryData && retryData.length > 0) {
                            setShopDocLat(parseFloat(retryData[0].lat).toFixed(6));
                            setShopDocLng(parseFloat(retryData[0].lon).toFixed(6));
                            showToast("Coordinates found from address search!");
                          } else {
                            alert("Could not find coordinates for: " + address);
                          }
                        }
                      } catch (error) {
                        console.error("Geocoding failed:", error);
                        alert("Failed to fetch coordinates from address.");
                      }
                    }}
                    style={{ padding: '6px 10px', fontSize: '11px', flex: 1, whiteSpace: 'nowrap' }}
                  >
                    🔍 Find from Address
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Documents Status:</span>
                <span className={`badge ${selectedShopDetails.docs === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedShopDetails.docs || 'Pending Approval'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Auth Login Account:</span>
                <span className={`badge ${selectedShopDetails.hasAuthAccount ? 'badge-success' : 'badge-warning'}`}>
                  {selectedShopDetails.hasAuthAccount ? 'Created' : 'Not Created'}
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

            <div className="divider" style={{ margin: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: 'bold', display: 'block' }}>🔐 Create Merchant Login Account</span>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Create a Firebase Auth login account for this shop.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Login Email:</span>
                <input 
                  type="email" 
                  placeholder="e.g. owner@gmail.com" 
                  value={tempAuthEmail}
                  onChange={(e) => setTempAuthEmail(e.target.value)}
                  className="custom-input-premium"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Login Password:</span>
                <input 
                  type="password" 
                  placeholder="Enter login password" 
                  value={tempAuthPassword}
                  onChange={(e) => setTempAuthPassword(e.target.value)}
                  className="custom-input-premium"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                />
                <button 
                  type="button" 
                  className="neon-btn small-btn" 
                  onClick={() => handleCreateAuthAccount('merchant', tempAuthEmail, tempAuthPassword, selectedShopDetails.id)}
                  style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(104, 166, 0, 0.1)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', display: 'inline-flex', alignSelf: 'flex-start', marginTop: '4px' }}
                >
                  Create Account
                </button>
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

      {/* Order Details Modal (Admin) */}
      {isOrderModalOpen && selectedOrderDetails && (
        <div className="modal-backdrop fade-in" onClick={() => { setIsOrderModalOpen(false); setSelectedOrderDetails(null); }}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}>
            <button className="modal-close-btn" onClick={() => { setIsOrderModalOpen(false); setSelectedOrderDetails(null); }}>
              <X size={20} />
            </button>
            
            <div className="profile-avatar-section" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className="profile-avatar-glow" style={{ background: 'rgba(0, 255, 242, 0.1)' }}>
                <ShoppingCart size={40} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="section-title-premium">Order Details</h3>
              <p className="profile-sub" style={{ marginTop: '4px' }}>Order ID: <strong>{selectedOrderDetails.id}</strong></p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', color: 'var(--color-text-main)', maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
              
              {/* Order Status & Progress */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Current Status:</span>
                  <span className={`badge ${
                    selectedOrderDetails.status === 'COMPLETED' ? 'badge-success' :
                    selectedOrderDetails.status === 'ACCEPTED' ? 'badge-success' :
                    selectedOrderDetails.status === 'ASSIGNED' ? 'badge-primary' :
                    selectedOrderDetails.status?.startsWith('CANCELLED') ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {(() => {
                      const statusUpper = selectedOrderDetails.status?.toUpperCase() || 'PLACED';
                      if (statusUpper === 'PLACED') return 'ORDER PLACED';
                      if (statusUpper === 'ACCEPTED') return 'ACCEPTED BY MERCHANT';
                      if (statusUpper === 'ASSIGNED') return 'ASSIGNED';
                      if (statusUpper === 'COMPLETED') return 'ORDER DELIVERED';
                      return statusUpper;
                    })()}
                  </span>
                </div>

                {/* Progress bar simulation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '15px 0 45px 0', padding: '0 5px' }}>
                  {['PLACED', 'ACCEPTED', 'ASSIGNED', 'COMPLETED'].map((step, idx, arr) => {
                    const statusIdx = arr.indexOf(selectedOrderDetails.status || 'PLACED');
                    const isActive = statusIdx >= idx && !selectedOrderDetails.status?.startsWith('CANCELLED');
                    
                    let displayName = 'Order Placed';
                    if (step === 'ACCEPTED') displayName = 'Accepted by Merchant';
                    else if (step === 'ASSIGNED') displayName = 'Assigned';
                    else if (step === 'COMPLETED') displayName = 'Order Delivered';

                    return (
                      <React.Fragment key={step}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>
                          <div style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            background: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                            boxShadow: isActive ? '0 0 6px var(--color-primary)' : 'none',
                            zIndex: 2
                          }}></div>
                          
                          {/* Absolute container for labels to keep dot/line alignment clean */}
                          <div style={{
                            position: 'absolute',
                            top: '18px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '110px',
                            textAlign: 'center',
                            pointerEvents: 'none'
                          }}>
                            <span style={{ 
                              fontSize: '9px', 
                              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)', 
                              fontWeight: '600',
                              lineHeight: '1.2'
                            }}>
                              {displayName}
                            </span>
                            {step === 'ASSIGNED' && selectedOrderDetails.deliveryPartnerName && (
                              <span style={{ 
                                fontSize: '8px', 
                                color: 'var(--color-text-muted)', 
                                marginTop: '2px', 
                                fontWeight: 'normal',
                                maxWidth: '100px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {selectedOrderDetails.deliveryPartnerName}
                              </span>
                            )}
                          </div>
                        </div>
                        {idx < arr.length - 1 && (
                          <div style={{ 
                            flexGrow: 1, 
                            height: '2px', 
                            background: (statusIdx > idx && !selectedOrderDetails.status?.startsWith('CANCELLED')) ? 'var(--color-primary)' : 'var(--color-border)', 
                            zIndex: 1
                          }}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>👨‍💼 Customer Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Name:</span>
                  <strong>{selectedOrderDetails.customerName}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Phone:</span>
                  <strong>{selectedOrderDetails.customerPhone}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Delivery Address:</span>
                  <span>{selectedOrderDetails.customerAddress || 'N/A'}</span>
                </div>
              </div>

              {/* Shop Information */}
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--color-warning)', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>🏪 Merchant Shop Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Shop Name:</span>
                  <strong>{selectedOrderDetails.items[0]?.store || selectedOrderDetails.merchantName}</strong>
                </div>
                {(() => {
                  const mShop = shops.find(s => s.name === selectedOrderDetails.merchantName || s.storeName === selectedOrderDetails.merchantName);
                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Category:</span>
                        <span>{mShop?.category || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Phone:</span>
                        <span>{mShop?.phone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Shop Address:</span>
                        <span>{mShop?.address || 'N/A'}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Items Ordered */}
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--color-neon-cyan)', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>📦 Items Ordered</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}>
                      <div>
                        <span>{item.emoji || '📦'} </span>
                        <strong>{item.name}</strong>
                        <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>x{item.quantity}</span>
                      </div>
                      <strong style={{ color: 'var(--color-success)' }}>{formatINR(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Items Subtotal:</span>
                  <span>{formatINR(selectedOrderDetails.totalAmount - selectedOrderDetails.deliveryCharge + (selectedOrderDetails.discountAmount || 0))}</span>
                </div>
                {selectedOrderDetails.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: 'var(--color-primary)' }}>
                    <span>Discount Applied:</span>
                    <span>-{formatINR(selectedOrderDetails.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Delivery Charge:</span>
                  <span>{formatINR(selectedOrderDetails.deliveryCharge)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '8px', fontWeight: 'bold' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: 'var(--color-success)' }}>{formatINR(selectedOrderDetails.totalAmount)}</span>
                </div>
              </div>

              {/* Rider & OTP */}
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>🏍️ Delivery & Security Info</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Assigned Rider:</span>
                  <strong>{selectedOrderDetails.deliveryPartnerName || 'Not Assigned'}</strong>
                </div>
                {selectedOrderDetails.deliveryPartnerId && (() => {
                  const rider = deliveryPartners.find(d => d.id === selectedOrderDetails.deliveryPartnerId);
                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Rider Phone:</span>
                        <span>{rider?.phone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Vehicle:</span>
                        <span>{rider?.vehicle || 'N/A'}</span>
                      </div>
                    </>
                  );
                })()}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Delivery OTP:</span>
                  <span style={{ background: 'var(--color-primary-glow)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content' }}>
                    {selectedOrderDetails.otp || 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginTop: '6px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Payment Details:</span>
                  <span>{selectedOrderDetails.paymentMethod} ({selectedOrderDetails.paymentStatus})</span>
                </div>
              </div>

            </div>

            <div className="divider" style={{ margin: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}></div>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {!['COMPLETED', 'DELIVERED', 'CANCELLED', 'CANCELLED_BY_STORE', 'CANCELLED_BY_RIDER', 'CANCELLED_BY_ADMIN'].includes(selectedOrderDetails.status?.toUpperCase()) && (
                <button 
                  className="neon-btn" 
                  onClick={() => handleAdminCancelOrder(selectedOrderDetails.id)}
                  style={{ flex: 1, padding: '12px', fontWeight: 'bold', background: 'var(--color-danger)', borderColor: 'var(--color-danger)', color: '#fff' }}
                >
                  Cancel Order
                </button>
              )}
              <button 
                className="neon-btn" 
                onClick={() => { setIsOrderModalOpen(false); setSelectedOrderDetails(null); }}
                style={{ flex: 1, padding: '12px', fontWeight: 'bold' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Rider */}
      {activeQrModalOrder && (
        <div className="modal-backdrop fade-in" onClick={() => setActiveQrModalOrder(null)}>
          <div className="customer-auth-modal-scene" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="portal-auth-card-dark" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
              <button className="modal-close-btn-dark" onClick={() => setActiveQrModalOrder(null)}>
                <X size={20} />
              </button>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Order {activeQrModalOrder.id} - Payment / Scan QR
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Please show this QR code to the customer for payment scan or confirmation.
              </p>
              
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', marginBottom: '16px' }}>
                <img 
                  src="/pixigo_payment_qr.png" 
                  alt="Payment QR Code" 
                  style={{ width: '240px', height: '240px', display: 'block', margin: '0 auto', borderRadius: '8px' }} 
                />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                <div>Total to Collect: <strong style={{ color: 'var(--color-success)', fontSize: '16px' }}>{formatINR(activeQrModalOrder.totalAmount)}</strong></div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Method: {activeQrModalOrder.paymentMethod}</div>
              </div>
              
              <button 
                className="neon-btn" 
                onClick={() => setActiveQrModalOrder(null)} 
                style={{ width: '100%', marginTop: '16px', fontWeight: 'bold' }}
              >
                Close QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Order Detail Modal */}
      {selectedAnalyticsMerchant && (
        <div className="modal-backdrop fade-in" onClick={() => setSelectedAnalyticsMerchant(null)}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '700px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedAnalyticsMerchant(null)}>
              <X size={20} />
            </button>
            
            <div className="profile-avatar-section" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className="profile-avatar-glow" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Store size={40} style={{ color: 'var(--color-warning)' }} />
              </div>
              <h3 className="section-title-premium">{selectedAnalyticsMerchant.name} Order Log</h3>
              <p className="profile-sub" style={{ marginTop: '4px' }}>Category: <strong>{selectedAnalyticsMerchant.category}</strong> | Contact: <strong>{selectedAnalyticsMerchant.phone}</strong></p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', color: 'var(--color-text-main)', maxHeight: '50vh', overflowY: 'auto' }}>
              <div className="analytics-table-wrapper" style={{ margin: 0, maxHeight: 'none' }}>
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date & Time</th>
                      <th>Customer</th>
                      <th>Items Ordered</th>
                      <th>Net Earning</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const merchantOrders = orders.filter(o => {
                        const mName = o.merchantName || o.storeName || (o.items && o.items[0]?.store);
                        return mName === selectedAnalyticsMerchant.name;
                      });

                      if (merchantOrders.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                              No orders found for this merchant.
                            </td>
                          </tr>
                        );
                      }

                      return merchantOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</td>
                          <td>
                            <div>{o.customerName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{o.customerPhone}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {o.items?.map((item, idx) => (
                                <div key={idx} style={{ fontSize: '12px' }}>
                                  • {item.name} <span style={{ color: 'var(--color-text-muted)' }}>(x{item.quantity || 1})</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: o.status?.startsWith('CANCELLED') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              {o.status?.startsWith('CANCELLED') ? '₹0' : `₹${o.netMerchantEarning || 0}`}
                            </strong>
                          </td>
                          <td>
                            <span className={`analytics-badge-pill ${
                              o.status === 'COMPLETED' ? 'analytics-badge-success' :
                              o.status?.startsWith('CANCELLED') ? 'analytics-badge-warning' :
                              'analytics-badge-info'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '20px' }}>
              <button 
                className="neon-btn" 
                onClick={() => setSelectedAnalyticsMerchant(null)}
                style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rider Deliveries Detail Modal */}
      {selectedAnalyticsRider && (
        <div className="modal-backdrop fade-in" onClick={() => setSelectedAnalyticsRider(null)}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '700px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedAnalyticsRider(null)}>
              <X size={20} />
            </button>
            
            <div className="profile-avatar-section" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className="profile-avatar-glow" style={{ background: 'rgba(0, 255, 242, 0.1)' }}>
                <Bike size={40} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="section-title-premium">{selectedAnalyticsRider.name} Delivery Run Log</h3>
              <p className="profile-sub" style={{ marginTop: '4px' }}>Vehicle: <strong>{selectedAnalyticsRider.vehicle}</strong> | Contact: <strong>{selectedAnalyticsRider.phone}</strong></p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', color: 'var(--color-text-main)', maxHeight: '50vh', overflowY: 'auto' }}>
              <div className="analytics-table-wrapper" style={{ margin: 0, maxHeight: 'none' }}>
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date & Time</th>
                      <th>Merchant (Pickup)</th>
                      <th>Customer (Delivery)</th>
                      <th>Payout</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const riderOrders = orders.filter(o => o.deliveryPartnerId === selectedAnalyticsRider.id);

                      if (riderOrders.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                              No delivery runs found for this agent.
                            </td>
                          </tr>
                        );
                      }

                      return riderOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</td>
                          <td><strong>{o.merchantName}</strong></td>
                          <td>
                            <div>{o.customerName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{o.customerPhone}</div>
                          </td>
                          <td>
                            <strong style={{ color: o.status === 'COMPLETED' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                              ₹{o.riderPayout || 0}
                            </strong>
                          </td>
                          <td>
                            <span className={`analytics-badge-pill ${
                              o.status === 'COMPLETED' ? 'analytics-badge-success' :
                              o.status?.startsWith('CANCELLED') ? 'analytics-badge-warning' :
                              'analytics-badge-info'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '20px' }}>
              <button 
                className="neon-btn" 
                onClick={() => setSelectedAnalyticsRider(null)}
                style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Group Detail Modal */}
      {selectedAnalyticsSalesGroup && (
        <div className="modal-backdrop fade-in" onClick={() => setSelectedAnalyticsSalesGroup(null)}>
          <div className="profile-edit-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '750px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedAnalyticsSalesGroup(null)}>
              <X size={20} />
            </button>
            
            <div className="profile-avatar-section" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className="profile-avatar-glow" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <DollarSign size={40} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="section-title-premium">
                {selectedAnalyticsSalesGroup === 'today' ? "Today's Gross Sales Log" : 
                 selectedAnalyticsSalesGroup === 'all-time' ? "All-Time Gross Sales Log" : 
                 "Cancelled Orders Log"}
              </h3>
              <p className="profile-sub" style={{ marginTop: '4px' }}>Detailed list of transaction records</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', color: 'var(--color-text-main)', maxHeight: '50vh', overflowY: 'auto' }}>
              <div className="analytics-table-wrapper" style={{ margin: 0, maxHeight: 'none' }}>
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date & Time</th>
                      <th>Merchant</th>
                      <th>Customer</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const todayStart = new Date();
                      todayStart.setHours(0, 0, 0, 0);

                      const targetOrders = orders.filter(o => {
                        if (selectedAnalyticsSalesGroup === 'today') {
                          return o.createdAt && new Date(o.createdAt) >= todayStart && !o.status?.startsWith('CANCELLED');
                        }
                        if (selectedAnalyticsSalesGroup === 'all-time') {
                          return !o.status?.startsWith('CANCELLED');
                        }
                        // cancelled
                        return o.status?.startsWith('CANCELLED');
                      });

                      if (targetOrders.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                              No order records found in this group.
                            </td>
                          </tr>
                        );
                      }

                      return targetOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</td>
                          <td><strong>{o.merchantName}</strong></td>
                          <td>
                            <div>{o.customerName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{o.customerPhone}</div>
                          </td>
                          <td>
                            <strong style={{ color: o.status?.startsWith('CANCELLED') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              ₹{o.totalAmount || 0}
                            </strong>
                          </td>
                          <td>
                            <span className={`analytics-badge-pill ${
                              o.status === 'COMPLETED' ? 'analytics-badge-success' :
                              o.status?.startsWith('CANCELLED') ? 'analytics-badge-warning' :
                              'analytics-badge-info'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '20px' }}>
              <button 
                className="neon-btn" 
                onClick={() => setSelectedAnalyticsSalesGroup(null)}
                style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
              >
                Close Log List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type} fade-in`}>
          {toast.type === 'error' || toast.type === 'warning' ? (
            <AlertCircle size={18} style={{ strokeWidth: 3, color: 'var(--color-danger)' }} />
          ) : (
            <Check size={18} style={{ strokeWidth: 3, color: 'var(--color-primary)' }} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
