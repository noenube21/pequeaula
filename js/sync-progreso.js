import { db, auth } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔥 SOLO SINCRONIZA (NO TOCA TU JUEGO)
export async function syncProgreso(datos){

    const user = auth.currentUser;
    if(!user) return;

    try {
        await setDoc(
            doc(db, "usuarios", user.uid),
            {
                progreso: datos,
                actualizado: Date.now()
            },
            { merge: true }
        );
    } catch (e) {
        console.warn("Sync fallo:", e);
    }
}
