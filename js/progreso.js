// =====================================================
//  IMPORTS
// =====================================================
import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
//  1. REGISTRAR RESULTADOS (VERSIÓN QUE FUNCIONABA)
// =====================================================
export async function registrarResultado(asignatura, correctas, incorrectas) {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    // Crear estructura si no existe
    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            puntos: 0,
            completado: false
        };
    }

    // SUMAR SOLO PUNTOS (tal como funcionaba antes)
    datos.progreso[asignatura].puntos += correctas;

    // COMPLETADO = antes era “si acierta más que falla”
    if (correctas > incorrectas) {
        datos.progreso[asignatura].completado = true;
    }

    // Guardar
    await setDoc(ref, { progreso: datos.progreso }, { merge: true });
}



// =====================================================
//  2. CARGAR PROGRESO (VERSIÓN QUE FUNCIONABA)
// =====================================================
async function cargarProgreso() {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const datos = snap.data();

    // Mostrar totales (estos funcionan bien)
    document.getElementById("partidas").textContent = datos.partidas || 0;
    document.getElementById("aciertos").textContent = datos.aciertos || 0;
    document.getElementById("errores").textContent = datos.errores || 0;

    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const porcentaje = partidas > 0 ? Math.round((aciertos / partidas) * 100) : 0;
    document.getElementById("porcentaje").textContent = porcentaje + "%";


    // === MOSTRAR ASIGNATURAS (VERSION QUE FUNCIONABA ANTES) ===
    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    if (!datos.progreso) return;

    for (const asignatura in datos.progreso) {

        const info = datos.progreso[asignatura];

        const div = document.createElement("div");
        div.classList.add("asignatura-box");

        div.innerHTML = `
            <p><strong>${asignatura.toUpperCase()}</strong></p>
            <p>Puntos: ${info.puntos}</p>
            <p>Completado: ${info.completado ? "Sí" : "No"}</p>
        `;

        contenedor.appendChild(div);
    }
}



// =====================================================
//  3. ACTIVAR
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
