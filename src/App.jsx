import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Shield, Compass, Bike, Store, Trash2, 
  FileText, Check, X, ArrowRight, Download, Search, Tag, 
  MessageCircle, AlertCircle, Plus, MapPin, DollarSign, Activity, Eye, Phone, RefreshCw, Menu,
  Mail
} from 'lucide-react';
import './App.css';
import { auth, db, googleProvider } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, onSnapshot, orderBy, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

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
  { id: 's1', name: 'Pooja Kirana Store', category: 'General Store', phone: '9251054064', verified: true, docs: 'Approved' },
  { id: 's2', name: 'Green Farms Veggies', category: 'Vegetable', phone: '9876543210', verified: true, docs: 'Approved' },
  { id: 's3', name: 'Krishna Dairy', category: 'Dairy', phone: '9988776655', verified: true, docs: 'Approved' },
  { id: 's4', name: 'Bake House', category: 'Bakery', phone: '9123456789', verified: true, docs: 'Approved' },
  { id: 's5', name: 'Grand Plaza Restaurant', category: 'Restaurant Cafe', phone: '9345678901', verified: false, docs: 'Pending' }
];

const INITIAL_DELIVERY_PARTNERS = [
  { id: 'd1', name: 'Amit Kumar', phone: '9251054064', vehicle: 'Splendor (RJ-14-SG-2024)', active: true, verified: true, totalDeliveries: 45, pendingPayout: 850 },
  { id: 'd2', name: 'Sanjay Sharma', phone: '9001122334', vehicle: 'Activa (RJ-14-PL-1998)', active: true, verified: true, totalDeliveries: 32, pendingPayout: 640 },
  { id: 'd3', name: 'Rahul Verma', phone: '9882233445', vehicle: 'Pulsar (RJ-14-TR-5006)', active: false, verified: false, totalDeliveries: 0, pendingPayout: 0 }
];

const INITIAL_ORDERS = [
  { 
    id: 'PG-9812', 
    customerName: 'Raj Malhotra', 
    customerPhone: '9551122334', 
    customerEmail: 'raj@gmail.com',
    customerLocation: 'Mansarovar, Jaipur (Lat: 26.85, Lng: 75.76)',
    items: [
      { id: 'p7', name: 'Chocolate Fudge Cake', price: 650, quantity: 1, store: 'Bake House' }
    ],
    totalAmount: 650,
    deliveryCharge: 40,
    discountAmount: 100,
    commissionAmount: 65,
    netMerchantEarning: 585,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    otp: '4920',
    deliveryPartnerId: 'd1',
    deliveryPartnerName: 'Amit Kumar',
    createdAt: '2026-06-11T12:30:00.000Z'
  },
  { 
    id: 'PG-9815', 
    customerName: 'Priya Sharma', 
    customerPhone: '9443322110', 
    customerEmail: 'priya@gmail.com',
    customerLocation: 'C-Scheme, Jaipur (Lat: 26.91, Lng: 75.80)',
    items: [
      { id: 'p9', name: 'Crispy Veg Burger', price: 140, quantity: 2, store: 'Burger Club' },
      { id: 'p15', name: 'Fresh Orange Juice (500ml)', price: 110, quantity: 1, store: 'Juice Junction' }
    ],
    totalAmount: 390,
    deliveryCharge: 35,
    discountAmount: 39,
    commissionAmount: 39,
    netMerchantEarning: 351,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'PLACED',
    otp: '1850',
    deliveryPartnerId: null,
    deliveryPartnerName: '',
    createdAt: '2026-06-12T08:15:00.000Z'
  }
];

function App() {
  // --- STATE DECLARATIONS ---
  const [activeTab, setActiveTab] = useState('customer'); // customer | admin | delivery | merchant
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [deliveryPartners, setDeliveryPartners] = useState(INITIAL_DELIVERY_PARTNERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [baseDeliveryCharge, setBaseDeliveryCharge] = useState(20);
  const [perKmCharge, setPerKmCharge] = useState(5);
  const [bankAccount, setBankAccount] = useState('SBI - A/C 98127391238 (IFSC: SBIN0007204)');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('all'); // all | item | shop | category
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
  const [toast, setToast] = useState({ show: false, message: '' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTrackingDrawerOpen, setIsTrackingDrawerOpen] = useState(false);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [adminSubView, setAdminSubView] = useState('orders'); // orders | shops | riders
  const [isMerchantApprovalsOpen, setIsMerchantApprovalsOpen] = useState(false);
  const [isRiderApprovalsOpen, setIsRiderApprovalsOpen] = useState(false);

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

          // 3. Sync with Rider collection if on delivery/rider page
          if (currentTab === 'delivery' || currentTab === 'rider') {
            const riderDocRef = doc(db, "delivery_boys", currentUser.uid);
            const riderSnap = await getDoc(riderDocRef);
            if (!riderSnap.exists()) {
              await setDoc(riderDocRef, {
                id: currentUser.uid,
                name: localName,
                email: localEmail,
                phone: localPhone,
                vehicle: 'Activa (Not verified)',
                active: true,
                verified: false,
                totalDeliveries: 0,
                pendingPayout: 0,
                createdAt: timestamp
              });
            }
          }

          // 4. Sync with Merchant collection if on merchant/shop page
          if (currentTab === 'merchant' || currentTab === 'shop') {
            const merchantDocRef = doc(db, "merchants", currentUser.uid);
            const merchantSnap = await getDoc(merchantDocRef);
            if (!merchantSnap.exists()) {
              await setDoc(merchantDocRef, {
                id: currentUser.uid,
                name: localName,
                email: localEmail,
                storeName: `${localName}'s Store`,
                category: 'General Store',
                phone: localPhone,
                verified: false,
                docs: 'Pending',
                createdAt: timestamp
              });
            }
          }
        } catch (e) {
          console.error("Error auto-syncing Firestore user profiles:", e);
        }

        setCustomerEmail(localEmail);
        setCustomerName(localName);
        setCustomerPhone(localPhone);
        setCustomerAddress(localAddress);
      } else {
        setUser(null);
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

  const handleAuthAction = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      alert('Please fill in both email and password!');
      return;
    }
    
    if (isSignUp) {
      createUserWithEmailAndPassword(auth, authEmail, authPassword)
        .then(async (userCredential) => {
          const uid = userCredential.user.uid;
          const email = authEmail;
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

            // 3. Sync with Rider collection if on delivery/rider page
            if (currentTab === 'delivery' || currentTab === 'rider') {
              const riderDocRef = doc(db, "delivery_boys", uid);
              await setDoc(riderDocRef, {
                id: uid,
                name: name,
                email: email,
                phone: '',
                vehicle: 'Activa (Not verified)',
                active: true,
                verified: false,
                totalDeliveries: 0,
                pendingPayout: 0,
                createdAt: timestamp
              });
            }

            // 4. Sync with Merchant collection if on merchant/shop page
            if (currentTab === 'merchant' || currentTab === 'shop') {
              const merchantDocRef = doc(db, "merchants", uid);
              await setDoc(merchantDocRef, {
                id: uid,
                name: name,
                email: email,
                storeName: `${name}'s Store`,
                category: 'General Store',
                phone: '',
                verified: false,
                docs: 'Pending',
                createdAt: timestamp
              });
            }
          } catch (e) {
            console.error("Error creating user documents in Firestore:", e);
          }
          alert(`Sign Up Successful for ${userCredential.user.email}!`);
          setIsAuthModalOpen(false);
          setAuthEmail('');
          setAuthPassword('');
        })
        .catch((error) => {
          alert(`Sign Up Error: ${error.message}`);
        });
    } else {
      signInWithEmailAndPassword(auth, authEmail, authPassword)
        .then((userCredential) => {
          alert(`Login Successful! Welcome back, ${userCredential.user.email.split('@')[0]}!`);
          setIsAuthModalOpen(false);
          setAuthEmail('');
          setAuthPassword('');
        })
        .catch((error) => {
          alert(`Login Error: ${error.message}`);
        });
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        alert('Logged out successfully!');
      })
      .catch((error) => {
        alert(`Logout Error: ${error.message}`);
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

    // Update local state first
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'COMPLETED',
          paymentStatus: 'PAID'
        };
      }
      return o;
    }));

    if (order.firestoreId) {
      try {
        const orderRef = doc(db, "orders", order.firestoreId);
        await updateDoc(orderRef, {
          status: 'COMPLETED',
          paymentStatus: 'PAID'
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

  // Merchant add custom product
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Bakery');
  const [merchantShopSelect, setMerchantShopSelect] = useState('Bake House');

  const handleMerchantAddProduct = async () => {
    if (!newProductName || !newProductPrice) return alert('Please fill in product name and price!');
    const newProd = {
      id: `p_${Date.now()}`,
      name: newProductName,
      price: parseFloat(newProductPrice),
      category: newProductCategory,
      store: merchantShopSelect,
      image: '🍔',
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

  // Filter products by search, mode, and category
  const filteredProducts = products.filter(p => {
    let matchQuery = true;
    if (searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      if (searchMode === 'shop') {
        matchQuery = p.store.toLowerCase().includes(queryLower);
      } else if (searchMode === 'item') {
        matchQuery = p.name.toLowerCase().includes(queryLower);
      } else if (searchMode === 'category') {
        matchQuery = p.category.toLowerCase().includes(queryLower);
      } else {
        // 'all' mode
        matchQuery = p.name.toLowerCase().includes(queryLower) || 
                     p.store.toLowerCase().includes(queryLower) || 
                     p.category.toLowerCase().includes(queryLower);
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
            
            <form onSubmit={handleAuthAction} className="auth-form-premium">
              <div className="form-group-premium">
                <label className="form-label-premium">Email Address</label>
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
              
              <button type="submit" className="neon-btn auth-submit-btn-premium">
                {isSignUp ? 'Register Staff Account' : 'Sign In to Panel'}
              </button>
            </form>

            <div className="divider"></div>

            <button 
              className="google-auth-btn-premium" 
              onClick={() => {
                signInWithPopup(auth, googleProvider)
                  .then((result) => {
                    showToast(`Logged in successfully as ${result.user.displayName || result.user.email}!`);
                  })
                  .catch((error) => {
                    alert(`Google Sign-In Error: ${error.message}`);
                  });
              }}
            >
              <span className="google-icon-premium">G</span> Sign In with Google
            </button>

            <p className="auth-toggle-text-premium">
              {isSignUp ? 'Already registered?' : 'Need a new panel account?'} {' '}
              <button className="toggle-btn-link-premium" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign In Instead' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      );
    }
    return children;
  };

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="app-header glass-panel">
        {/* Mobile menu trigger - placed first so it sits on the left on mobile */}
        {activeTab !== 'delivery' && activeTab !== 'admin' && (
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
            </div>
            <p className="tagline">Quick Home Delivery Service</p>
          </div>
        </div>

        {/* Tab Controls (Desktop only) */}
        {activeTab !== 'delivery' && activeTab !== 'admin' && (
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

              {/* Search Bar */}
              <div className="search-container border-glow">
                <div className="search-mode-select-wrap">
                  <select 
                    value={searchMode} 
                    onChange={(e) => setSearchMode(e.target.value)}
                    className="search-mode-select"
                  >
                    <option value="all">Search All</option>
                    <option value="item">By Product</option>
                    <option value="shop">By Shop</option>
                    <option value="category">By Category</option>
                  </select>
                </div>
                <div className="search-input-divider"></div>
                <div className="search-input-wrap">
                  <Search size={18} className="search-bar-icon" />
                  <input 
                    type="text" 
                    placeholder={
                      searchMode === 'shop' ? 'Enter shop name (e.g., Bake House)...' :
                      searchMode === 'item' ? 'Enter product name (e.g., Atta, Burger)...' :
                      searchMode === 'category' ? 'Enter category (e.g., Dairy, Vegetable)...' :
                      'Search products, shops, or categories...'
                    }
                    className="search-input" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                      <span className="prod-store">{p.store}</span>
                      <h3 className="prod-title">{p.name}</h3>
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
                          <div className="map-grid-overlay"></div>
                          <MapPin size={16} className="map-pin-merchant pulse" />
                          <div className="map-route-line-sidebar"></div>
                          <Bike size={16} className={`map-rider-bike ${trackedOrder.status === 'ASSIGNED' ? 'riding' : ''} rider-pulse`} />
                          <User size={16} className="map-pin-customer" />
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
                              <p>Vehicle: {INITIAL_DELIVERY_PARTNERS.find(d => d.id === trackedOrder.deliveryPartnerId)?.vehicle.split(' (')[0] || '🛵'}</p>
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
            {/* Metric widgets */}
            <div className="metrics-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div 
                className="metric-card glass-panel"
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  border: adminSubView === 'orders' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: adminSubView === 'orders' ? '0 0 15px var(--color-primary-glow-strong)' : 'none'
                }}
                onClick={() => setAdminSubView('orders')}
              >
                <ShoppingCart size={24} className="metric-icon" />
                <div className="metric-val">{stats.totalOrders}</div>
                <div className="metric-label">Total Orders</div>
              </div>
              <div 
                className="metric-card glass-panel"
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  border: adminSubView === 'shops' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: adminSubView === 'shops' ? '0 0 15px var(--color-primary-glow-strong)' : 'none'
                }}
                onClick={() => setAdminSubView('shops')}
              >
                <Store size={24} className="metric-icon text-primary" />
                <div className="metric-val">{stats.activeMerchants}</div>
                <div className="metric-label">Active Shops</div>
              </div>
              <div 
                className="metric-card glass-panel"
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  border: adminSubView === 'riders' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: adminSubView === 'riders' ? '0 0 15px var(--color-primary-glow-strong)' : 'none'
                }}
                onClick={() => setAdminSubView('riders')}
              >
                <Bike size={24} className="metric-icon text-info" />
                <div className="metric-val">{stats.activeRiders}</div>
                <div className="metric-label">Active Riders</div>
              </div>
              <div className="metric-card glass-panel highlight-profit">
                <DollarSign size={24} className="metric-icon text-neon" />
                <div className="metric-val">{formatINR(stats.netProfit)}</div>
                <div className="metric-label">Admin Net Profit</div>
              </div>
            </div>

            {/* Dynamic Dashboard Subview Content */}
            {adminSubView === 'orders' && (
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
                      {orders.map(o => (
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
                              <div className="badge badge-primary">{o.deliveryPartnerName}</div>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminSubView === 'shops' && (
              <div className="admin-orders-table glass-panel fade-in">
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
                      </tr>
                    </thead>
                    <tbody>
                      {shops.map(s => (
                        <tr key={s.id}>
                          <td><strong>{s.id}</strong></td>
                          <td>{s.name}</td>
                          <td><span className="badge badge-info">{s.category}</span></td>
                          <td>{s.phone || 'N/A'}</td>
                          <td>
                            <span className={`badge ${s.verified ? 'badge-success' : 'badge-warning'}`}>
                              {s.verified ? 'Verified & Active' : 'Pending Verification'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminSubView === 'riders' && (
              <div className="admin-orders-table glass-panel fade-in">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Onboarding Grid */}
            <div className="admin-onboarding-panel">
              <div className="approval-card glass-panel">
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
                                <Check size={16} /> Approve
                              </button>
                              <button className="reject-btn" onClick={() => handleAdminVerifyUser('merchant', s.id, false)}>
                                <X size={16} /> Reject
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

              <div className="approval-card glass-panel">
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
                                <Check size={16} /> Approve
                              </button>
                              <button className="reject-btn" onClick={() => handleAdminVerifyUser('rider', d.id, false)}>
                                <X size={16} /> Reject
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
            </div>

            {/* General Configurations & About Us Section */}
            <div className="admin-configs-grid">
              <div className="config-card glass-panel">
                <h2>Global System Configurations</h2>
                <div className="form-group">
                  <label>Merchant Commission Percentage (%)</label>
                  <input 
                    type="number" 
                    value={commissionPercent} 
                    onChange={(e) => setCommissionPercent(parseFloat(e.target.value))} 
                    className="custom-input"
                  />
                </div>
                <div className="form-group">
                  <label>Base Delivery Charge (₹)</label>
                  <input 
                    type="number" 
                    value={baseDeliveryCharge} 
                    onChange={(e) => setBaseDeliveryCharge(parseFloat(e.target.value))} 
                    className="custom-input"
                  />
                </div>
                <div className="form-group">
                  <label>Per-Km Distance Fare (₹/km)</label>
                  <input 
                    type="number" 
                    value={perKmCharge} 
                    onChange={(e) => setPerKmCharge(parseFloat(e.target.value))} 
                    className="custom-input"
                  />
                </div>
                <div className="form-group">
                  <label>Gateway Bank Account</label>
                  <input 
                    type="text" 
                    value={bankAccount} 
                    onChange={(e) => setBankAccount(e.target.value)} 
                    className="custom-input"
                  />
                </div>
              </div>

              <div className="config-card glass-panel">
                <h2>About Us & Support Desk</h2>
                <p><strong>Customer Care Email:</strong> pixigodelivery@gmail.com</p>
                <p><strong>WhatsApp Support:</strong> +91 9251054064</p>
                <p><strong>Social Links:</strong> Instagram: @pixigo_ | Facebook: pixigo</p>
                <div className="divider"></div>
                <h4>Modify Storefront Categories</h4>
                <div className="cat-admin-list">
                  {categories.slice(1).map(c => (
                    <span key={c} className="cat-badge">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* ==================== DELIVERY RIDER PORTAL ==================== */}
        {activeTab === 'delivery' && renderPortalGuard('Delivery Rider', (() => {
          const currentRider = deliveryPartners.find(d => d.id === user?.uid);
          
          const isAadhaarUploaded = currentRider?.aadhaarUploaded || false;
          const isDlUploaded = currentRider?.dlUploaded || false;
          const isRcUploaded = currentRider?.rcUploaded || false;
          const isPanUploaded = currentRider?.panUploaded || false;
          const isAllUploaded = isAadhaarUploaded && isDlUploaded && isRcUploaded && isPanUploaded;
          
          const activeJobs = orders.filter(o => o.deliveryPartnerId === user?.uid && o.status !== 'COMPLETED');
          const completedJobs = orders.filter(o => o.deliveryPartnerId === user?.uid && o.status === 'COMPLETED');
          
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
                  <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                      {formatINR(completedJobs.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0))}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Earnings (Payouts)</div>
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
                          <h3>Order {o.id}</h3>
                          <span className="badge badge-warning">{o.status}</span>
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
        {activeTab === 'merchant' && renderPortalGuard('Merchant Dashboard', (
          <div className="merchant-portal-wrap fade-in">
            <div className="merchant-layout glass-panel">
              <div className="merchant-onboarding">
                <h2>Merchant Onboarding Form</h2>
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

              <div className="divider"></div>

              <div className="merchant-management-grid">
                {/* Catalog Creator */}
                <div className="catalog-creator">
                  <h2>Add Product to Catalog</h2>
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
                  <h2>My Listed Products ({products.filter(p => p.store === merchantShopSelect).length})</h2>
                  <div className="listed-items-container">
                    {products.filter(p => p.store === merchantShopSelect).map(p => (
                      <div key={p.id} className="listed-item-row">
                        <div className="item-details">
                          <span className="item-emoji">{p.image}</span>
                          <div>
                            <h4>{p.name}</h4>
                            <span className="badge badge-info">{p.category}</span>
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
        ))}
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
        <div className="modal-backdrop fade-in" onClick={() => setIsAuthModalOpen(false)}>
          <div className="auth-modal-card glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="auth-icon-badge">
              <User size={36} className="text-neon" />
            </div>
            
            <div className="auth-modal-header" style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 className="auth-portal-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-portal-subtitle">Access your PixiGo Delivery dashboard</p>
            </div>
            
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
              
              <button type="submit" className="neon-btn auth-submit-btn-premium">
                {isSignUp ? 'Create PixiGo Account' : 'Sign In'}
              </button>
            </form>

            <div className="divider"></div>

            <button 
              className="google-auth-btn-premium" 
              onClick={() => {
                signInWithPopup(auth, googleProvider)
                  .then((result) => {
                    alert(`Login Successful via Google! Welcome, ${result.user.displayName || result.user.email}!`);
                    setIsAuthModalOpen(false);
                  })
                  .catch((error) => {
                    alert(`Google Sign-In Error: ${error.message}`);
                  });
              }}
            >
              <span className="google-icon-premium">G</span> Sign In with Google
            </button>

            <p className="auth-toggle-text-premium">
              {isSignUp ? 'Already registered?' : 'Need a new account?'} {' '}
              <button className="toggle-btn-link-premium" onClick={() => setIsSignUp(!isSignUp)}>
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
                    <div className="map-grid-overlay"></div>
                    <MapPin size={16} className="map-pin-merchant pulse" />
                    <div className="map-route-line-sidebar"></div>
                    <Bike size={16} className={`map-rider-bike ${trackedOrder.status === 'ASSIGNED' ? 'riding' : ''} rider-pulse`} />
                    <User size={16} className="map-pin-customer" />
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
                        <p>Vehicle: {INITIAL_DELIVERY_PARTNERS.find(d => d.id === trackedOrder.deliveryPartnerId)?.vehicle.split(' (')[0] || '🛵'}</p>
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
