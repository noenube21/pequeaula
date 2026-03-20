// =====================================================
// IMPORTS
// =====================================================
import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
// 1. REGISTRAR RESULTADOS DE UN JUEGO (nivel1, nivel2, nivel3)
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
            aciertos: 0,
            errores: 0
        };
    }

    // Sumar
    datos.progreso[asignatura].aciertos += correctas;
    datos.progreso[asignatura].errores += incorrectas;

    await setDoc(ref, { progreso: datos.progreso }, { merge: true });

    console.log("✔ Registrado:", asignatura, correctas, incorrectas);
}



// =====================================================
// 2. CARGAR PROGRESO AGRUPADO POR ASIGNATURA
// =====================================================
async function cargarProgreso() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const datos = snap.data();

    // ---- VALORES GENERALES ----
    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    const porcentaje = partidas > 0 ?
        Math.round((aciertos / partidas) * 100) : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";


    // ---- AGRUPAR POR ASIGNATURA REAL ----
    const asignaturas = {
        matematicas: ["matematicas1", "matematicas2", "matematicas3"],
        castellano: ["castellano1", "castellano2", "castellano3"],
        ingles: ["ingles1", "ingles2", "ingles3"],
        ciencias: ["ciencias1", "ciencias2", "ciencias3"]
    };

    const orden = ["matematicas", "castellano", "ingles", "ciencias"];

    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    // ---- RECORRER EN ORDEN ----
    for (const materia of orden) {
        const niveles = asignaturas[materia];

        let aciertosSum = 0;
        let erroresSum = 0;

        niveles.forEach(nivel => {
            if (datos.progreso && datos.progreso[nivel]) {
                aciertosSum += datos.progreso[nivel].aciertos || 0;
                erroresSum  += datos.progreso[nivel].errores  || 0;
            }
        });

        // Si la asignatura tiene 0 datos → no mostrar
        if (aciertosSum === 0 && erroresSum === 0) continue;

        const total = aciertosSum + erroresSum;
        const porcentajeMateria =
            total > 0 ? Math.round(aciertosSum / total * 100) : 0;

        const div = document.createElement("div");
        div.classList.add("asignatura-box");

        div.innerHTML = `
            <p><strong>${materia.toUpperCase()}</strong></p>
            <p>Aciertos: ${aciertosSum}</p>
            <p>Errores: ${erroresSum}</p>
            <p>Porcentaje: ${porcentajeMateria}%</p>
            <p>Completado: ${porcentajeMateria >= 70 ? "✔ Sí" : "✘ No"}</p>
        `;

        contenedor.appendChild(div);
    }
}



// =====================================================
// 3. ACTIVAR
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
``
