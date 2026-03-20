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
// 1. REGISTRAR RESULTADOS (ACERTADOS / FALLADOS)
// =====================================================
export async function registrarResultado(asignatura, correctas, incorrectas) {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    // Sumar totales globales
    const partidasTotales = (datos.partidas || 0) + 1;
    const aciertosTotales = (datos.aciertos || 0) + correctas;
    const erroresTotales = (datos.errores || 0) + incorrectas;

    // Guardar
    await setDoc(ref, {
        partidas: partidasTotales,
        aciertos: aciertosTotales,
        errores: erroresTotales
    }, { merge: true });
}


// =====================================================
// 2. BORRAR / RESETEAR TODO EL PROGRESO GLOBAL
// =====================================================
export async function resetearProgreso() {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);

    await updateDoc(ref, {
        partidas: 0,
        aciertos: 0,
        errores: 0
    });

    alert("Progreso reiniciado");
    location.reload();
}


// =====================================================
// 3. CARGAR PROGRESO GLOBAL (SIMPLE Y CLARO)
// =====================================================
async function cargarProgreso() {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const datos = snap.data();

    // Valores globales
    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    const porcentaje =
        partidas > 0 ? Math.round((aciertos / (aciertos + errores)) * 100) : 0;

    // Pintar datos
    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";
}


// =====================================================
// 4. ACTIVAR AUTO-CARGA
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
``
