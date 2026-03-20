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
// Se llama desde los juegos: registrarResultado("ingles3", 1, 0)
export async function registrarResultado(asignatura, correctas, incorrectas) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    // Si no hay datos previos, crear objeto
    let datos = snap.exists() ? snap.data() : {};

    // Totales globales
    const partidasTotales = (datos.partidas || 0) + 1;
    const aciertosTotales = (datos.aciertos || 0) + correctas;
    const erroresTotales = (datos.errores || 0) + incorrectas;

    // Crear estructura por asignatura si no existe
    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            puntos: 0,
            completado: false,
            intentos: 0,
            aciertosAsignatura: 0
        };
    }

    // Sumar puntos e intentos
    datos.progreso[asignatura].puntos += correctas;
    datos.progreso[asignatura].intentos++;
    datos.progreso[asignatura].aciertosAsignatura += correctas;

    // =====================================================
    // 🔥 COMPLETADO SI SUPERA EL 70% DE ACIERTOS
    // =====================================================
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

    console.log("✔ Progreso actualizado correctamente.");
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

    // Porcentaje global de acierto
    const porcentaje = partidas > 0
        ? Math.round((aciertos / partidas) * 100)
        : 0;

    // Mostrar datos globales
    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";

    // Contenedor
    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    // =====================================================
    // 🔵 MOSTRAR PROGRESO POR ASIGNATURA
    // =====================================================
    if (datos.progreso) {
        for (const asignatura in datos.progreso) {
            const info = datos.progreso[asignatura];

            const div = document.createElement("div");
            div.classList.add("asignatura-box");

            const porcentajeAsignatura = info.intentos > 0
                ? Math.round((info.aciertosAsignatura / info.intentos) * 100)
                : 0;

            div.innerHTML = `
                <p><strong>${asignatura.toUpperCase()}</strong></p>
                <p>Puntos: ${info.puntos}</p>
                <p>Aciertos totales: ${info.aciertosAsignatura}</p>
                <p>Intentos: ${info.intentos}</p>
                <p>Porcentaje: ${porcentajeAsignatura}%</p>
                <p>Completado: ${info.completado ? "✔ Sí" : "✘ No"}</p>
            `;

            contenedor.appendChild(div);
        }
    }
}



// =====================================================
//  🔵 3. ACTIVAR CARGA AUTOMÁTICA DEL PROGRESO
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
