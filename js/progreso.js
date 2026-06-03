import { auth, db } from "./firebase-config.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =======================================
// 💾 GUARDAR PROGRESO (FIREBASE)
// =======================================

export async function guardarProgreso(datos) {

    const usuario = auth.currentUser;

    if (!usuario) return;

    try {
        await setDoc(
            doc(db, "usuarios", usuario.uid),
            {
                progreso: datos,
                actualizado: serverTimestamp()
            },
            { merge: true }
        );

        console.log("✅ Progreso guardado en Firebase");

    } catch (error) {
        console.error("❌ Error guardando progreso:", error);
    }
}


// =======================================
// 📥 CARGAR PROGRESO (FIREBASE)
// =======================================

export async function cargarProgreso() {

    const usuario = auth.currentUser;

    if (!usuario) return null;

    try {
        const ref = doc(db, "usuarios", usuario.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();

            // IMPORTANTE: devolvemos SOLO progreso
            return data.progreso || null;
        }

        return null;

    } catch (error) {
        console.error("❌ Error cargando progreso:", error);
        return null;
    }
}
