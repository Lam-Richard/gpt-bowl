require('./node_modules/dotenv/lib/main').config({ path: './firebase.env' })



const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = JSON.parse(process.env.FIREBASE_JSON);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function getData() {
    let data = {};
    const snapshot = await db.collection('Science').get();
    snapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });
    return data;
}

async function writeData(question, answer) {
    const newRef = db.collection('Science').doc(); 
    newRef.set({
        'question': question,
        'answer': answer
    }).then(() => {
        console.log("Success")
    }).catch((error) => {
        console.error("Error: ", error)
    })
    return;
}

module.exports = { writeData, getData }
