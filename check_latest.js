import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBuCFaDfli0PTF2xyROHuR8qfHkb1H4oDM",
  authDomain: "pixi-go-delivery.firebaseapp.com",
  projectId: "pixi-go-delivery",
  storageBucket: "pixi-go-delivery.firebasestorage.app",
  messagingSenderId: "985286465902",
  appId: "1:985286465902:web:9235c2ab2572493e8d897f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLatestOrder() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log("No orders found.");
    return;
  }
  snapshot.docs.forEach(doc => {
    const data = doc.data();
  console.log("Latest Order ID:", data.id);
  console.log("Status:", data.status);
  console.log("Delivery Partner ID:", data.deliveryPartnerId);
  console.log("Delivery Partner Name:", data.deliveryPartnerName);
  console.log("Rider ID:", data.riderId);
  console.log("Rider Accepted:", data.riderAccepted);
  console.log("---");
  });
}

checkLatestOrder().catch(console.error);
