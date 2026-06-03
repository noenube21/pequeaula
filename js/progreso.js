import { auth, db } from "./firebase-config.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// =======================================
// 💾 GUARDAR PROGRESO
// =======================================

export async function guardarProgreso(datos) {

    // 🔥 SI HAY USUARIO → FIREBASE
    const usuario = auth.currentUser;

    if (usuario) {
        try {
            await setDoc(
                doc(db, "usuarios", usuario.uid),
                datos,
                { merge: true }
            );

            console.log("✅ Progreso guardado en Firebase");
            return;
        } catch (e) {
            console.warn("Firebase error, guardando local:", e);
        }
    }

    // 💾 FALLBACK LOCAL
    localStorage.setItem("progreso", JSON.stringify(datos));
    console.log("💾 Progreso guardado en localStorage");
}


// =======================================
// 📥 CARGAR PROGRESO
// =======================================

export async function cargarProgreso() {

    const usuario = auth.currentUser;

    // 🔥 FIREBASE PRIORIDAD
    if (usuario) {
        try {
            const ref = doc(db, "usuarios", usuario.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                return snap.data();
            }
        } catch (e) {
            console.warn("Firebase error, usando local:", e);
        }
    }

    // 💾 LOCAL FALLBACK
    const local = localStorage.getItem("progreso");

    return local ? JSON.parse(local) : null;
}
