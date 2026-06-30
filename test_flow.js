import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, query, where, addDoc, orderBy } from 'firebase/firestore';

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

async function testFlow() {
  console.log("Starting test flow...");
  const orderId = `PG-TEST-${Math.floor(Math.random() * 1000)}`;
  
  // 1. Create order
  const newOrder = {
    id: orderId,
    status: 'PLACED',
    customerId: 'test_user',
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, "orders"), newOrder);
  console.log(`Created order ${orderId} with doc ID ${docRef.id}`);
  
  // 2. Subscribe to it like a logged-in customer
  const q = query(collection(db, "orders"), where("customerId", "==", "test_user"), orderBy("createdAt", "desc"));
  let updateCount = 0;
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    updateCount++;
    if (snapshot.empty) {
      console.log(`Update ${updateCount}: Empty snapshot!`);
    } else {
      const data = snapshot.docs[0].data();
      console.log(`Update ${updateCount}: Order status is ${data.status}, deliveryPartnerId is ${data.deliveryPartnerId}`);
    }
  });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Admin accepts it
  console.log("Admin accepting order...");
  await updateDoc(doc(db, "orders", docRef.id), { status: 'ACCEPTED' });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // 4. Rider accepts it
  console.log("Rider accepting order...");
  await updateDoc(doc(db, "orders", docRef.id), {
    status: 'ASSIGNED',
    deliveryPartnerId: 'rider_test',
    deliveryPartnerName: 'Test Rider',
    riderId: 'rider_test',
    riderAccepted: true
  });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  unsubscribe();
  console.log("Test finished.");
}

testFlow().catch(console.error);
