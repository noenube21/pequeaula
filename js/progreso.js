// =====================================================
// IMPORTS
// =====================================================
import { auth, db } from "../firebase-config.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
// 1. REGISTRAR RESULTADO (GLOBAL + POR NIVEL)
// =====================================================
export async function registrarResultado(asignaturaNivel, acierto, error) {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    // ✅ GLOBAL
    const partidas = (datos.partidas || 0) + 1;
    const aciertos = (datos.aciertos || 0) + acierto;
    const errores = (datos.errores || 0) + error;

    // ✅ PROGRESO POR NIVEL
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


// =====================================================
// 2. RESETEAR PROGRESO COMPLETO
// =====================================================
export async function resetearProgreso() {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);

    await updateDoc(ref, {
        partidas: 0,
        aciertos: 0,
        errores: 0,
        progreso: {}
    });

    alert("✅ Progreso reiniciado correctamente");
    location.reload();
}


// =====================================================
// 3. CARGAR PROGRESO GLOBAL (PANTALLA)
// =====================================================
async function cargarProgreso() {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const datos = snap.data();

    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    const total = aciertos + errores;
    const porcentaje = total ? Math.round((aciertos / total) * 100) : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";
}


// =====================================================
// 4. AUTO CARGA
// =====================================================
auth.onAuthStateChanged((user) => {
    if (user) cargarProgreso();
});
