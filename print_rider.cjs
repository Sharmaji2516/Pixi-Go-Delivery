const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

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

async function printRider() {
  try {
    const docRef = doc(db, "delivery_boys", "rider_1781414760617");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Rider Data:", JSON.stringify(data, null, 2));
      console.log("name length:", data.name ? data.name.length : 0);
      console.log("name charCodes:", data.name ? [...data.name].map(c => c.charCodeAt(0)) : []);
    } else {
      console.log("No such rider!");
    }
  } catch (error) {
    console.error("Error fetching rider:", error);
  }
  process.exit(0);
}

printRider();
