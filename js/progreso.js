import { auth, db } from "./firebase-config.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// =======================================
// 🔥 GUARDAR PROGRESO (LOCAL + FIREBASE)
// =======================================
export async function guardarProgreso(datos){

    // LOCAL (SIEMPRE)
    localStorage.setItem("progreso", JSON.stringify(datos));

    // FIREBASE (OPCIONAL)
    const user = auth.currentUser;
    if(!user) return;

    try {
        await setDoc(
            doc(db, "usuarios", user.uid),
            datos,
            { merge: true }
        );
    } catch (e) {
        console.warn("Firebase error:", e);
    }
}

// =======================================
// 🔥 CARGAR PROGRESO (LOCAL PRIMERO)
// =======================================
export async function cargarProgreso(){

    // 1. LOCAL SIEMPRE FUNCIONA
    const local = JSON.parse(localStorage.getItem("progreso"));

    // 2. FIREBASE OPCIONAL
    const user = auth.currentUser;

    if(!user){
        return local;
    }

    try {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);

        if(snap.exists()){
            return {
                ...local,
                ...snap.data()
            };
        }

        return local;

    } catch (e) {
        console.warn("Firebase error:", e);
        return local;
    }
}
