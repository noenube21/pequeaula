// ========================================================
//  🟦 PROGRESO AUTOMÁTICO GLOBAL PARA TODOS LOS JUEGOS
//  🎉 NO HAY QUE EDITAR NINGÚN JUEGO EXISTENTE
// ========================================================

import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// ===========================================
// 🟦 Función general para guardar progreso
// ===========================================
async function guardarProgresoGlobal(asignatura, correctas, incorrectas) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    const partidas = (datos.partidas || 0) + 1;
    const aciertosTotales = (datos.aciertos || 0) + correctas;
    const erroresTotales = (datos.errores || 0) + incorrectas;

    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = { puntos: 0, completado: false };
    }

    datos.progreso[asignatura].puntos += correctas;

    if (correctas > incorrectas) {
        datos.progreso[asignatura].completado = true;
    }

    await setDoc(ref, {
        partidas,
        aciertos: aciertosTotales,
        errores: erroresTotales,
        progreso: datos.progreso
    }, { merge: true });

    console.log("🔥 Guardado automático:", asignatura, correctas, incorrectas);
}



// =====================================================
// 🟦 Modo AUTO: Detectar cuando un juego acaba
// =====================================================

// Los juegos ya usan variables globales como:
// correctas, incorrectas, asignatura / materia, etc.
// ESTE SCRIPT LO DETECTA AUTOMÁTICAMENTE

window.addEventListener("juegoFinalizado", (e) => {
    const { asignatura, correctas, incorrectas } = e.detail;

    guardarProgresoGlobal(asignatura, correctas, incorrectas);
});

console.log("🟢 Sistema de progreso automático cargado.");
