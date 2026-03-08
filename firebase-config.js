import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNSNwtZ319-EMpsgxm-D23OngJWe_jSyU",
  authDomain: "pequeaula-47b12.firebaseapp.com",
  projectId: "pequeaula-47b12",
  storageBucket: "pequeaula-47b12.firebasestorage.app",
  messagingSenderId: "628215823058",
  appId: "1:628215823058:web:f5e5b81b06a359bb2a0b0b",
  measurementId: "G-800FVPXMEF"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
