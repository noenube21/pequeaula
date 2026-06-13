import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

// Firebase init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// GLOBAL
window.auth = auth;
window.db = db;

// 🔥 SOLO UNA PROMESA (IMPORTANTE)
window.firebaseReady = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {

        if (user) {
            window.uid = user.uid;
            window.userReady = true;
            console.log("✅ Usuario Firebase listo:", user.uid);
        } else {
            window.uid = null;
            window.userReady = false;
            console.log("⚠️ No hay usuario autenticado");
        }

        resolve(user);
    });
});

export { auth, db };
