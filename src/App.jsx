import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Shield, Compass, Bike, Store, Trash2, 
  FileText, Check, X, ArrowRight, Download, Search, Tag, 
  MessageCircle, AlertCircle, Plus, MapPin, DollarSign, Activity, Eye, Phone, RefreshCw
} from 'lucide-react';
import './App.css';
import { auth, db, googleProvider } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';

// Initial Mock Data
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Fresh Kirana Atta (5kg)', price: 280, category: 'General Store', store: 'Pooja Kirana Store', image: '🌾' },
  { id: 'p2', name: 'Organic Mustard Oil (1L)', price: 175, category: 'General Store', store: 'Pooja Kirana Store', image: '🛢️' },
  { id: 'p3', name: 'Fresh Farm Tomatoes (1kg)', price: 40, category: 'Vegetable', store: 'Green Farms Veggies', image: '🍅' },
  { id: 'p4', name: 'Alphonso Mangoes (1kg)', price: 250, category: 'Vegetable', store: 'Green Farms Veggies', image: '🥭' },
  { id: 'p5', name: 'Creamy Paneer (200g)', price: 90, category: 'Dairy', store: 'Krishna Dairy', image: '🥛' },
  { id: 'p6', name: 'Amul Salted Butter (100g)', price: 56, category: 'Dairy', store: 'Krishna Dairy', image: '🧈' },
  { id: 'p7', name: 'Chocolate Fudge Cake', price: 650, category: 'Bakery', store: 'Bake House', image: '🎂' },
  { id: 'p8', name: 'Garlic Bread Sticks', price: 120, category: 'Bakery', store: 'Bake House', image: '🥖' },
  { id: 'p9', name: 'Crispy Veg Burger', price: 140, category: 'Fast Food', store: 'Burger Club', image: '🍔' },
  { id: 'p10', name: 'Cheese Pizza (Medium)', price: 320, category: 'Fast Food', store: 'Pizza Corner', image: '🍕' },
  { id: 'p11', name: 'Butter Chicken with Butter Naan', price: 380, category: 'Restaurant Cafe', store: 'Grand Plaza Restaurant', image: '🍛' },
  { id: 'p12', name: 'Belgian Chocolate Waffle', price: 190, category: 'Restaurant Cafe', store: 'Sweet Treat Cafe', image: '🧇' },
  { id: 'p13', name: 'Double Chocolate Ice Cream', price: 150, category: 'Icecream and dessert', store: 'Gelato Heaven', image: '🍨' },
  { id: 'p14', name: 'Premium Multi-vitamins (60 Caps)', price: 890, category: 'Medical and fitness', store: 'Apollo Wellness', image: '💊' },
  { id: 'p15', name: 'Fresh Orange Juice (500ml)', price: 110, category: 'Juice and drink', store: 'Juice Junction', image: '🍹' },
  { id: 'p16', name: 'Masala Chai Mix (250g)', price: 180, category: 'Snacks and breakfast', store: 'Tea Valley', image: '☕' }
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
  const [activeTab, setActiveTab] = useState('customer'); // customer | admin | delivery | merchant

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email.split('@')[0]
        });
        setCustomerEmail(currentUser.email);
        setCustomerName(currentUser.displayName || currentUser.email.split('@')[0]);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    window.history.pushState(null, '', `/${tabName}`);
  };
  
  // Platform States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [deliveryPartners, setDeliveryPartners] = useState(INITIAL_DELIVERY_PARTNERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  
  // Settings & Configuration States
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [baseDeliveryCharge, setBaseDeliveryCharge] = useState(20);
  const [perKmCharge, setPerKmCharge] = useState(5);
  const [bankAccount, setBankAccount] = useState('SBI - A/C 98127391238 (IFSC: SBIN0007204)');
  
  // Customer View States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('Raj Malhotra');
  const [customerPhone, setCustomerPhone] = useState('9251054064'); // Provided user contact
  const [customerEmail, setCustomerEmail] = useState('pixigodelivery@gmail.com'); // Provided user email
  const [customerAddress, setCustomerAddress] = useState('Vaishali Nagar, Jaipur (RJ)');
  const [selectedPayment, setSelectedPayment] = useState('ONLINE');
  const [currentOrderTracking, setCurrentOrderTracking] = useState(null);
  
  // Document uploads for Delivery/Merchant
  const [uploadStatus, setUploadStatus] = useState({});

  // Mobile / UI state enhancements
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null); // Simulated authenticated user
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthAction = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      alert('Please fill in both email and password!');
      return;
    }
    
    if (isSignUp) {
      createUserWithEmailAndPassword(auth, authEmail, authPassword)
        .then((userCredential) => {
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
      createdAt: new Date().toISOString()
    };

    try {
      // Save order to Firestore Database
      await addDoc(collection(db, "orders"), newOrder);
      
      // Update local state for immediate UI tracking feedback
      setOrders([newOrder, ...orders]);
      setCart([]);
      setCouponCode('');
      setAppliedDiscount(0);
      setCurrentOrderTracking(newOrder.id);
      alert(`Order Placed Successfully! Order ID: ${newOrder.id}. Saved to Firebase Database.`);
    } catch (error) {
      alert(`Failed to save order to Database: ${error.message}`);
    }
  };

  // Admin: Accept / Confirm Order
  const handleAdminAcceptOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'ACCEPTED' } : o));
  };

  // Admin: Assign Rider to Order
  const handleAdminAssignRider = (orderId, riderId) => {
    const rider = deliveryPartners.find(d => d.id === riderId);
    if (!rider) return;

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

    // Alert simulation
    alert(`Delivery rider ${rider.name} assigned to Order ${orderId}. OTP ${orders.find(o => o.id === orderId).otp} generated.`);
  };

  // Admin: Verification Approvals
  const handleAdminVerifyUser = (type, id, status) => {
    if (type === 'merchant') {
      setShops(shops.map(s => s.id === id ? { ...s, verified: status, docs: status ? 'Approved' : 'Rejected' } : s));
    } else {
      setDeliveryPartners(deliveryPartners.map(d => d.id === id ? { ...d, verified: status } : d));
    }
  };

  // Rider: Validate OTP and Deliver
  const [riderInputOTP, setRiderInputOTP] = useState('');
  const handleRiderCompleteDelivery = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.paymentMethod === 'ONLINE' && riderInputOTP !== order.otp) {
      return alert('Invalid OTP Code! Please confirm with the customer.');
    }

    // Update order status
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

  const handleMerchantAddProduct = () => {
    if (!newProductName || !newProductPrice) return alert('Please fill in product name and price!');
    const newProd = {
      id: `p${products.length + 1}`,
      name: newProductName,
      price: parseFloat(newProductPrice),
      category: newProductCategory,
      store: merchantShopSelect,
      image: '🍔'
    };
    setProducts([...products, newProd]);
    setNewProductName('');
    setNewProductPrice('');
    alert('Product added to listing catalog!');
  };

  const handleMerchantDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Filter products by search and category
  const filteredProducts = products.filter(p => {
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchQuery && matchCat;
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
          </div>
        ) : (
          <div className="cart-items-list">
            {cart.map(item => (
              <div key={item.id} className="cart-row">
                <span className="cart-item-emoji">{item.image}</span>
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

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="app-header glass-panel">
        <div className="header-logo">
          {logoError ? (
            <div className="logo-fallback-icon-wrap">
              <Bike size={28} className="text-neon" />
            </div>
          ) : (
            <img 
              src="/logo.png" 
              alt="PixiGo Logo" 
              className="brand-logo" 
              onError={() => setLogoError(true)} 
            />
          )}
          <div className="logo-text">
            <div className="logo-brand-name">
              <span className="brand-highlight">PIXI</span><span className="brand-light">go</span>
            </div>
            <p className="tagline">Quick Home Delivery Service</p>
          </div>
        </div>

        {/* Tab Controls */}
        <nav className="header-nav">
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

        {/* Header Actions (Auth & Mobile Cart) */}
        <div className="header-actions">
          {activeTab === 'customer' && (
            <button className="cart-header-icon-btn" onClick={() => setIsCartDrawerOpen(true)}>
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="cart-badge-count-header">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="user-profile-menu">
              <span className="user-welcome">Hi, {user.name}</span>
              <button className="secondary-btn logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="neon-btn login-trigger-btn" onClick={() => { setIsSignUp(false); setIsAuthModalOpen(true); }}>
              <User size={16} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Portals Container */}
      <main className="portal-content">
        
        {/* ==================== CUSTOMER VIEW ==================== */}
        {activeTab === 'customer' && (
          <div className="customer-portal-layout fade-in">
            {/* Order Status Tracking Widget (FULL WIDTH AT TOP) */}
            {orders.length > 0 && (
              <div className="tracking-card glass-panel mb-6">
                <div className="panel-header">
                  <h2 className="section-title"><Compass size={20} /> Live Order Status</h2>
                  <div className="tracking-tabs">
                    {orders.slice(0, 3).map((o, idx) => (
                      <button 
                        key={o.id} 
                        className={`track-tab-btn ${currentOrderTracking === o.id || (!currentOrderTracking && idx === 0) ? 'active' : ''}`}
                        onClick={() => setCurrentOrderTracking(o.id)}
                      >
                        {o.id}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const trackedOrder = orders.find(o => o.id === (currentOrderTracking || orders[0].id));
                  if (!trackedOrder) return null;

                  return (
                    <div className="tracked-order-detail fade-in">
                      {/* Live Delivery ETA Header */}
                      <div className="eta-banner">
                        <div className="eta-icon-wrap">
                          <Activity size={24} className="text-neon pulse-glow" />
                        </div>
                        <div>
                          <span className="eta-label">Estimated Delivery Time</span>
                          <h3 className="eta-countdown">
                            {trackedOrder.status === 'COMPLETED' ? 'Delivered successfully!' : 
                             trackedOrder.status === 'ASSIGNED' ? 'Arriving in ~14 mins' :
                             trackedOrder.status === 'ACCEPTED' ? 'Preparing order... ~22 mins' :
                             'Awaiting Confirmation... ~30 mins'}
                          </h3>
                        </div>
                      </div>

                      {/* Interactive Vertical Timeline + Map Grid */}
                      <div className="tracking-layout-grid">
                        {/* Left: Vertical Timeline */}
                        <div className="vertical-timeline">
                          <div className={`timeline-item ${['PLACED', 'ACCEPTED', 'ASSIGNED', 'COMPLETED'].includes(trackedOrder.status) ? 'active' : ''}`}>
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <h4>Order Placed</h4>
                            </div>
                          </div>
                          <div className={`timeline-item ${['ACCEPTED', 'ASSIGNED', 'COMPLETED'].includes(trackedOrder.status) ? 'active' : ''}`}>
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <h4>Shop Confirmed</h4>
                            </div>
                          </div>
                          <div className={`timeline-item ${['ASSIGNED', 'COMPLETED'].includes(trackedOrder.status) ? 'active' : ''}`}>
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <h4>Courier Assigned</h4>
                            </div>
                          </div>
                          <div className={`timeline-item ${trackedOrder.status === 'COMPLETED' ? 'active' : ''}`}>
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <h4>Delivered</h4>
                            </div>
                          </div>
                        </div>

                        {/* Right: Map and Info */}
                        <div className="tracking-map-meta">
                          {/* Map Simulation */}
                          <div className="leaflet-mock-map border-glow">
                            <div className="map-grid-overlay"></div>
                            <MapPin size={24} className="map-pin-merchant pulse" />
                            <div className="map-route-line"></div>
                            <Bike size={24} className={`map-rider-bike ${trackedOrder.status === 'ASSIGNED' ? 'riding' : ''} rider-pulse`} />
                            <User size={24} className="map-pin-customer" />
                            <span className="map-label-merchant">{trackedOrder.items[0]?.store || 'Merchant'}</span>
                            <span className="map-label-customer">Home (Raj)</span>
                          </div>

                          <div className="tracked-order-info-pills">
                            <span className="info-pill-item">
                              <strong>Status:</strong> 
                              <span className={`badge ${trackedOrder.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                                {trackedOrder.status}
                              </span>
                            </span>
                            <span className="info-pill-item">
                              <strong>Payment:</strong> 
                              <span className={`badge badge-info`}>
                                {trackedOrder.paymentMethod} ({trackedOrder.paymentStatus})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Boy details */}
                      {trackedOrder.deliveryPartnerId ? (
                        <div className="rider-card-info border-glow">
                          <div className="rider-avatar">🛵</div>
                          <div className="rider-desc">
                            <div className="rider-header-line">
                              <h4>{trackedOrder.deliveryPartnerName}</h4>
                              <span className="rider-rating">⭐ 4.8</span>
                            </div>
                            <p>Rider Contact: {INITIAL_DELIVERY_PARTNERS.find(d => d.id === trackedOrder.deliveryPartnerId)?.phone || 'N/A'}</p>
                            <p>Vehicle: {INITIAL_DELIVERY_PARTNERS.find(d => d.id === trackedOrder.deliveryPartnerId)?.vehicle || 'N/A'}</p>
                          </div>
                          <div className="otp-pill pulse-glow-border">
                            <span>OTP: <strong>{trackedOrder.otp}</strong></span>
                          </div>
                        </div>
                      ) : (
                        <div className="rider-info-pending">
                          <RefreshCw size={16} className="spin" />
                          <span>Waiting for Admin to assign nearby delivery boy...</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
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

              {/* Search Bar */}
              <div className="search-wrap">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search products or local shops..." 
                  className="search-input" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Product Grid */}
              <div className="products-grid">
                {filteredProducts.map(p => (
                  <div key={p.id} className="product-card glass-panel">
                    <div className="prod-emoji">{p.image}</div>
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
              {/* Shopping Cart & Checkout Sidebar (Desktop only) */}
              <div className="checkout-sidebar desktop-only">
                {renderCartContent(false)}
              </div>
            </div>

          </div> {/* Closes .customer-grid */}
        </div> /* Closes .customer-portal-layout */
      )}

        {/* ==================== ADMIN PORTAL ==================== */}
        {activeTab === 'admin' && (
          <div className="admin-grid fade-in">
            {/* Metric widgets */}
            <div className="metrics-container">
              <div className="metric-card glass-panel">
                <ShoppingCart size={24} className="metric-icon" />
                <div className="metric-val">{stats.totalOrders}</div>
                <div className="metric-label">Total Orders</div>
              </div>
              <div className="metric-card glass-panel">
                <Store size={24} className="metric-icon text-primary" />
                <div className="metric-val">{stats.activeMerchants}</div>
                <div className="metric-label">Active Shops</div>
              </div>
              <div className="metric-card glass-panel">
                <Bike size={24} className="metric-icon text-info" />
                <div className="metric-val">{stats.activeRiders}</div>
                <div className="metric-label">Active Riders</div>
              </div>
              <div className="metric-card glass-panel">
                <Activity size={24} className="metric-icon text-success" />
                <div className="metric-val">{formatINR(stats.totalSales)}</div>
                <div className="metric-label">Total Sales</div>
              </div>
              <div className="metric-card glass-panel">
                <Tag size={24} className="metric-icon text-warning" />
                <div className="metric-val">{formatINR(stats.totalDiscounts)}</div>
                <div className="metric-label">Total Discounts</div>
              </div>
              <div className="metric-card glass-panel highlight-profit">
                <DollarSign size={24} className="metric-icon text-neon" />
                <div className="metric-val">{formatINR(stats.netProfit)}</div>
                <div className="metric-label">Admin Net Profit</div>
              </div>
            </div>

            {/* Orders Queue Table */}
            <div className="admin-orders-table glass-panel">
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

            {/* Document Onboarding Grid */}
            <div className="admin-onboarding-panel">
              <div className="approval-card glass-panel">
                <h2>Merchant Verification Applications</h2>
                <div className="approval-list">
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
              </div>

              <div className="approval-card glass-panel">
                <h2>Delivery Boy Onboarding Verification</h2>
                <div className="approval-list">
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
        )}

        {/* ==================== DELIVERY RIDER PORTAL ==================== */}
        {activeTab === 'delivery' && (
          <div className="delivery-portal-wrap fade-in">
            <div className="delivery-layout glass-panel">
              <div className="rider-onboarding-section">
                <h2>Rider Document Verification Hub</h2>
                <p className="sub-text">Please upload your documents to be approved by PixiGo Admins.</p>
                <div className="document-upload-grid">
                  <div className="doc-uploader">
                    <span>Aadhaar Card Front/Back</span>
                    <button className="upload-box-btn" onClick={() => alert('Mock Aadhaar uploaded successfully!')}>
                      Select Document
                    </button>
                  </div>
                  <div className="doc-uploader">
                    <span>Driving Licence (DL)</span>
                    <button className="upload-box-btn" onClick={() => alert('Mock DL uploaded successfully!')}>
                      Select Document
                    </button>
                  </div>
                  <div className="doc-uploader">
                    <span>Vehicle RC</span>
                    <button className="upload-box-btn" onClick={() => alert('Mock RC uploaded successfully!')}>
                      Select Document
                    </button>
                  </div>
                  <div className="doc-uploader">
                    <span>PAN Card</span>
                    <button className="upload-box-btn" onClick={() => alert('Mock PAN uploaded successfully!')}>
                      Select Document
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Rider Active Orders */}
              <div className="rider-orders-section">
                <h2>Assigned Delivery Jobs</h2>
                {orders.filter(o => o.deliveryPartnerId === 'd1' && o.status !== 'COMPLETED').length === 0 ? (
                  <div className="no-jobs-card">
                    <Bike size={32} className="text-muted" />
                    <p>No active delivery runs assigned to you at the moment.</p>
                  </div>
                ) : (
                  orders.filter(o => o.deliveryPartnerId === 'd1' && o.status !== 'COMPLETED').map(o => (
                    <div key={o.id} className="job-card glass-panel">
                      <div className="job-header">
                        <h3>Order {o.id}</h3>
                        <span className="badge badge-warning">{o.status}</span>
                      </div>

                      <div className="job-info-grid">
                        <div className="job-meta-box">
                          <h4>🏪 Merchant Pickup</h4>
                          <p><strong>Shop:</strong> {o.items[0]?.store}</p>
                          <p><strong>Location:</strong> Vaishali Market Area, Jaipur</p>
                          <a href={`tel:9251054064`} className="phone-link-btn">
                            <Phone size={14} /> Call Shop Owner
                          </a>
                        </div>

                        <div className="job-meta-box">
                          <h4>🏠 Customer Delivery</h4>
                          <p><strong>Name:</strong> {o.customerName}</p>
                          <p><strong>Address:</strong> {o.customerLocation}</p>
                          <a href={`tel:${o.customerPhone}`} className="phone-link-btn">
                            <Phone size={14} /> Call Customer
                          </a>
                        </div>
                      </div>

                      <div className="leaflet-mock-map select-rider-map">
                        <MapPin size={20} className="map-pin-merchant" />
                        <div className="map-route-line"></div>
                        <Bike size={20} className="map-rider-bike riding" />
                        <User size={20} className="map-pin-customer" />
                      </div>

                      <div className="job-otp-form">
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
            </div>
          </div>
        )}

        {/* ==================== MERCHANT DASHBOARD ==================== */}
        {activeTab === 'merchant' && (
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
        )}
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
          <div className="auth-modal glass-panel border-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="auth-modal-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-subtitle">Sign {isSignUp ? 'up' : 'in'} to order from local shops instantly</p>
            </div>
            
            <form onSubmit={handleAuthAction} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>
              
              <button type="submit" className="neon-btn auth-submit-btn">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div className="divider"></div>

            <button 
              className="google-auth-btn" 
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
              <span className="google-icon">G</span> Sign in with Google
            </button>

            <p className="auth-toggle-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
              <button className="toggle-btn-link" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign In' : 'Sign Up Now'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
