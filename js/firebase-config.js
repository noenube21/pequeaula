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

// ✅ Inicializar Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth
const auth = getAuth(app);

// ✅ Firestore
const db = getFirestore(app);

// ✅ HACER GLOBAL (clave para tu juego)
window.auth = auth;
window.db = db;

// ✅ DETECTAR USUARIO CON PROMESA DE ESPERA (Solución para la asincronía)
window.firebaseReady = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.uid = user.uid;
            window.userReady = true;
            console.log("✅ Usuario Firebase listo:", user.uid);
            resolve(user); // Resolvemos la promesa entregando el usuario activo
        } else {
            window.uid = null;
            window.userReady = false;
            console.log("⚠️ No hay usuario autenticado");
            resolve(null); // Resolvemos con null si es un invitado
        }
    });
});

// ✅ Exportar (si lo usas en otros sitios)
export { auth, db };
