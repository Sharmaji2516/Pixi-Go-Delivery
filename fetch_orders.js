const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBuCFaDfli0PTF2xyROHuR8qfHkb1H4oDM",
  authDomain: "pixi-go-delivery.firebaseapp.com",
  projectId: "pixi-go-delivery",
  storageBucket: "pixi-go-delivery.firebasestorage.app",
  messagingSenderId: "985286465902",
  appId: "1:985286465902:web:9235c2ab2572493e8d897f",
  measurementId: "G-FYL3PLNCK6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    console.log(`Total orders found in Firestore: ${querySnapshot.size}`);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}, Customer: ${data.customerName}, Email: ${data.customerEmail}, Status: ${data.status}`);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
  process.exit(0);
}

checkOrders();
