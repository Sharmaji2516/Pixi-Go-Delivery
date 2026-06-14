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

async function checkDatabase() {
  try {
    const ridersSnapshot = await getDocs(collection(db, "delivery_boys"));
    console.log(`\n--- RIDERS FOUND (${ridersSnapshot.size}) ---`);
    ridersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}, Name: ${data.name}, Phone: ${data.phone}`);
    });

    const merchantsSnapshot = await getDocs(collection(db, "merchants"));
    console.log(`\n--- MERCHANTS FOUND (${merchantsSnapshot.size}) ---`);
    merchantsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}, StoreName: ${data.storeName}, Name: ${data.name}, Phone: ${data.phone}`);
    });
  } catch (error) {
    console.error("Error fetching db status:", error);
  }
  process.exit(0);
}

checkDatabase();
