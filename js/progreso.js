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
// 1. REGISTRAR RESULTADOS
// =====================================================
export async function registrarResultado(asignatura, correctas, incorrectas) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            aciertos: 0,
            errores: 0
        };
    }

    datos.progreso[asignatura].aciertos += correctas;
    datos.progreso[asignatura].errores += incorrectas;

    await setDoc(ref, { progreso: datos.progreso }, { merge: true });
}



// =====================================================
// 2. CARGAR PROGRESO AGRUPADO POR ASIGNATURA REAL
// =====================================================
async function cargarProgreso() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const datos = snap.data();

    // ====== TOTALES GENERALES ======
    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    const porcentajeGlobal =
        partidas > 0 ? Math.round(aciertos / partidas * 100) : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentajeGlobal + "%";


    // GRUPOS FLEXIBLES — DETECTA TU FIRESTORE REAL
    const grupos = {
        matematicas: [],
        castellano: [],
        ingles: [],
        ciencias: []
    };

    for (const clave in datos.progreso) {
        const claveMin = clave.toLowerCase();

        if (claveMin.startsWith("matematicas")) grupos.matematicas.push(clave);
        else if (claveMin.startsWith("castellano")) grupos.castellano.push(clave);
        else if (claveMin.startsWith("ingles")) grupos.ingles.push(clave);
        else if (claveMin.startsWith("ciencias")) grupos.ciencias.push(clave);
    }

    // ORDEN FIJO QUE TÚ PEDISTE
    const orden = ["matematicas", "castellano", "ingles", "ciencias"];

    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    for (const materia of orden) {

        const clavesMateria = grupos[materia];
        if (clavesMateria.length === 0) continue;

        let aciertosSum = 0;
        let erroresSum = 0;

        clavesMateria.forEach(k => {
            const info = datos.progreso[k] || {};
            aciertosSum += info.aciertos || 0;
            erroresSum  += info.errores  || 0;
        });

        const total = aciertosSum + erroresSum;
        const porcentaje =
            total > 0 ? Math.round(aciertosSum / total * 100) : 0;

        const div = document.createElement("div");
        div.classList.add("asignatura-box");

        div.innerHTML = `
            <p><strong>${materia.toUpperCase()}</strong></p>
            <p>Aciertos: ${aciertosSum}</p>
            <p>Errores: ${erroresSum}</p>
            <p>Porcentaje: ${porcentaje}%</p>
            <p>Completado: ${porcentaje >= 70 ? "✔ Sí" : "✘ No"}</p>
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
