// =======================================
// IMPORTS
// =======================================
import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =======================================
// 1. REGISTRAR RESULTADO (POR NIVEL + GLOBAL)
// =======================================
export async function registrarResultado(asignaturaNivel, acierto, error) {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    // GLOBAL
    const partidas = (datos.partidas || 0) + 1;
    const aciertos = (datos.aciertos || 0) + acierto;
    const errores = (datos.errores || 0) + error;

    // 👉 PROGRESO POR NIVEL
    let progreso = datos.progreso || {};

    if (!progreso[asignaturaNivel]) {
        progreso[asignaturaNivel] = {
            aciertos: 0,
            errores: 0
        };
    }

    progreso[asignaturaNivel].aciertos += acierto;
    progreso[asignaturaNivel].errores += error;

    await setDoc(ref, {
        partidas,
        aciertos,
        errores,
        progreso
    }, { merge: true });
}
