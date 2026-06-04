import { db } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// GUARDAR PROGRESO
export async function guardarFirestore(email, datos){
    try {
        await setDoc(doc(db, "usuarios", email), datos);
    } catch (e) {
        console.log("Error guardando:", e);
    }
}

// CARGAR PROGRESO
export async function cargarFirestore(email){
    try {
        const ref = doc(db, "usuarios", email);
        const snap = await getDoc(ref);

        if(snap.exists()){
            return snap.data();
        }

        return null;
    } catch (e) {
        console.log("Error cargando:", e);
        return null;
    }
}
