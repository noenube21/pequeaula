import { auth, db } from "../firebase-config.js";
import { setDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/**
 * Crear usuario al registrarse
 */
export async function crearUsuario(uid, email, tipo) {
    await setDoc(doc(db, "usuarios", uid), {
        email,
        role: tipo,   // "alumno" o "padre"
        hijos: [],    // si es padre
        nivel: 1,
        recompensas: {},
        progreso: {}
    }, { merge: true });
}

/**
 * Vincular hijo a un padre
 */
export async function vincularHijo(padreId, hijoId) {
    const padreRef = doc(db, "usuarios", padreId);
    const snap = await getDoc(padreRef);
    
    if (!snap.exists()) return;

    const datos = snap.data();
    const hijos = datos.hijos || [];

    if (!hijos.includes(hijoId)) {
        hijos.push(hijoId);
        await updateDoc(padreRef, { hijos });
    }
}
