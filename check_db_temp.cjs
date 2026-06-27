const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBuCFaDfli0PTF2xyROHuR8qfHkb1H4oDM",
  authDomain: "pixi-go-delivery.firebaseapp.com",
  projectId: "pixi-go-delivery",
  storageBucket: "pixi-go-delivery.firebasestorage.app",
  messagingSenderId: "985286465902",
  appId: "1:985286465902:web:9235c2ab2572493e8d897f",
  measurementId: "G-FYL3PLNCK6",
  databaseURL: "https://pixi-go-delivery-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkMerchant() {
  console.log("=== CHECKING SHARMA CAFE MERCHANT DOCUMENT ===");
  const targetEmail = "lavsharma.cor@gmail.com";

  const merchantsRef = collection(db, "merchants");
  const q = query(merchantsRef, where("email", "==", targetEmail));
  const snap = await getDocs(q);

  if (!snap.empty) {
    snap.forEach(doc => {
      console.log(`DocID=${doc.id}`, doc.data());
    });
  } else {
    console.log("Merchant document not found!");
  }
  process.exit(0);
}

checkMerchant().catch(err => {
  console.error(err);
  process.exit(1);
});
