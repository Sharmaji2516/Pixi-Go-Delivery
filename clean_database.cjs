const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, deleteDoc } = require("firebase/firestore");
const { getDatabase, ref, remove } = require("firebase/database");

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
const rtdb = getDatabase(app);

async function cleanDatabase() {
  console.log("🚀 Starting database wipe (clean slate)...");
  try {
    // 1. Wipe merchants
    console.log("🧹 Clearing 'merchants' collection...");
    const merchantsSnapshot = await getDocs(collection(db, "merchants"));
    console.log(`Found ${merchantsSnapshot.size} merchants.`);
    let merchantCount = 0;
    for (const document of merchantsSnapshot.docs) {
      await deleteDoc(doc(db, "merchants", document.id));
      merchantCount++;
    }
    console.log(`Successfully deleted ${merchantCount} merchants.`);

    // 2. Wipe delivery boys
    console.log("🧹 Clearing 'delivery_boys' collection...");
    const ridersSnapshot = await getDocs(collection(db, "delivery_boys"));
    console.log(`Found ${ridersSnapshot.size} riders.`);
    let riderCount = 0;
    for (const document of ridersSnapshot.docs) {
      await deleteDoc(doc(db, "delivery_boys", document.id));
      riderCount++;
    }
    console.log(`Successfully deleted ${riderCount} riders.`);

    // 3. Wipe orders
    console.log("🧹 Clearing 'orders' collection...");
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    console.log(`Found ${ordersSnapshot.size} orders.`);
    let orderCount = 0;
    for (const document of ordersSnapshot.docs) {
      await deleteDoc(doc(db, "orders", document.id));
      orderCount++;
    }
    console.log(`Successfully deleted ${orderCount} orders.`);

    // 4. Wipe RTDB deliveries
    console.log("🧹 Clearing RTDB 'deliveries' path...");
    try {
      await remove(ref(rtdb, "deliveries"));
      console.log("Successfully cleared RTDB tracking paths.");
    } catch (rtdbErr) {
      console.warn("RTDB warning (non-critical):", rtdbErr.message);
    }

    console.log("🎉 Database wipe complete! Starting with a clean slate.");
  } catch (error) {
    console.error("❌ Error during database wipe:", error);
  }
  process.exit(0);
}

cleanDatabase();
