const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, updateDoc } = require("firebase/firestore");

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

async function updateMerchantCoords() {
  console.log("🚀 Starting merchant coordinates update to Chittorgarh Collectorate...");
  try {
    const merchantsSnapshot = await getDocs(collection(db, "merchants"));
    console.log(`Found ${merchantsSnapshot.size} merchants in database.`);
    
    let updatedCount = 0;
    for (const merchantDoc of merchantsSnapshot.docs) {
      const docRef = doc(db, "merchants", merchantDoc.id);
      await updateDoc(docRef, {
        lat: 24.8887,
        lng: 74.6269
      });
      console.log(`- Updated ${merchantDoc.id} (${merchantDoc.data().storeName || 'Unknown'})`);
      updatedCount++;
    }
    console.log(`🎉 Successfully updated coordinates for ${updatedCount} merchants!`);
  } catch (error) {
    console.error("❌ Error updating merchant coordinates:", error);
  }
  process.exit(0);
}

updateMerchantCoords();
