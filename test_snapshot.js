const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc } = require('firebase/firestore');

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

const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
console.log("Listening to orders...");
onSnapshot(q, (snapshot) => {
  console.log("Snapshot received, size:", snapshot.size);
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    console.log(`Latest order status: ${data.status}`);
  }
});
