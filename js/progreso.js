// =====================================================
//  🔵 IMPORTS
// =====================================================
import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
//  🔵 1. REGISTRAR RESULTADOS DE LOS JUEGOS
// =====================================================
export async function registrarResultado(asignatura, correctas, incorrectas) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    // Totales globales
    const partidasTotales = (datos.partidas || 0) + 1;
    const aciertosTotales = (datos.aciertos || 0) + correctas;
    const erroresTotales = (datos.errores || 0) + incorrectas;

    // Crear estructura si no existe
    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            puntos: 0,
            completado: false,
            intentos: 0,
            aciertosAsignatura: 0
        };
    }

    // Sumar datos
    datos.progreso[asignatura].puntos += correctas;
    datos.progreso[asignatura].intentos =
        (datos.progreso[asignatura].intentos || 0) + 1;

    datos.progreso[asignatura].aciertosAsignatura =
        (datos.progreso[asignatura].aciertosAsignatura || 0) + correctas;

    // ⭐ COMPLETADO = si supera el 70%
    const porcentajeAsignatura =
        (datos.progreso[asignatura].aciertosAsignatura /
         datos.progreso[asignatura].intentos) * 100;

    datos.progreso[asignatura].completado = porcentajeAsignatura >= 70;

    // Guardar en Firestore
    await setDoc(ref, {
        partidas: partidasTotales,
        aciertos: aciertosTotales,
        errores: erroresTotales,
        progreso: datos.progreso
    }, { merge: true });
}



// =====================================================
//  🔵 2. CARGAR PROGRESO EN PANTALLA
// =====================================================
async function cargarProgreso() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const datos = snap.data();

    // Totales globales
    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    // Porcentaje global
    const porcentaje = partidas > 0
        ? Math.round((aciertos / partidas) * 100)
        : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";

    // Mostrar por asignatura
    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    if (datos.progreso) {
        for (const asignatura in datos.progreso) {
            const info = datos.progreso[asignatura];

            // 💛 Evitar undefined dejando valores por defecto
            const puntos = info.puntos || 0;
            const aciertosA = info.aciertosAsignatura || 0;
            const intentos = info.intentos || 0;
            const porcentajeAsign = intentos > 0
                ? Math.round((aciertosA / intentos) * 100)
                : 0;

            const div = document.createElement("div");
            div.classList.add("asignatura-box");

            div.innerHTML = `
                <p><strong>${asignatura.toUpperCase()}</strong></p>
                <p>Puntos: ${puntos}</p>
                <p>Aciertos totales: ${aciertosA}</p>
                <p>Intentos: ${intentos}</p>
                <p>Porcentaje: ${porcentajeAsign}%</p>
                <p>Completado: ${info.completado ? "✔ Sí" : "✘ No"}</p>
            `;

            contenedor.appendChild(div);
        }
    }
}



// =====================================================
//  🔵 3. ACTIVAR CARGA
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
