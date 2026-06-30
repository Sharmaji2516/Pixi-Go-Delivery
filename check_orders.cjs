const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkOrders() {
  const snapshot = await db.collection("orders").orderBy("createdAt", "desc").limit(2).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log("Order ID:", data.id);
    console.log("Status:", data.status);
    console.log("Delivery Partner ID:", data.deliveryPartnerId);
    console.log("Delivery Partner Name:", data.deliveryPartnerName);
    console.log("Cancelled By:", data.cancelledBy);
    console.log("---");
  });
}

checkOrders().catch(console.error);
