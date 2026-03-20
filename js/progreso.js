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
//  1. REGISTRAR RESULTADOS DE UN JUEGO
// =====================================================
export async function registrarResultado(asignatura, correctas, incorrectas) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    // Crear estructura global si no existe
    if (!datos.progreso) datos.progreso = {};

    // Crear estructura de asignatura si no existe
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            aciertos: 0,
            errores: 0,
            completado: false
        };
    }

    // Sumar
    datos.progreso[asignatura].aciertos += correctas;
    datos.progreso[asignatura].errores += incorrectas;

    // Calcular porcentaje
    const total = datos.progreso[asignatura].aciertos +
                  datos.progreso[asignatura].errores;

    const porcentaje = total > 0
        ? Math.round((datos.progreso[asignatura].aciertos / total) * 100)
        : 0;

    // COMPLETADO = ≥70%
    datos.progreso[asignatura].completado = porcentaje >= 70;

    // Guardar en Firestore
    await setDoc(ref, {
        progreso: datos.progreso
    }, { merge: true });

    console.log("✔ Progreso actualizado:", datos.progreso[asignatura]);
}



// =====================================================
//  2. CARGAR PROGRESO EN PÁGINA (ORDENADO)
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

    const porcentaje = partidas > 0
        ? Math.round((aciertos / partidas) * 100)
        : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";

    // Contenedor
    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    // 🎯 ORDEN DE ASIGNATURAS CORRECTO
    const orden = ["matematicas", "castellano", "ingles", "ciencias"];

    // Mostrar progreso en orden
    if (datos.progreso) {
        for (const materia of orden) {

            // Buscar niveles: matematicas1, matematicas2, matematicas3...
            let totalAciertos = 0;
            let totalErrores = 0;

            for (const clave in datos.progreso) {
                if (clave.startsWith(materia)) {
                    totalAciertos += datos.progreso[clave].aciertos || 0;
                    totalErrores += datos.progreso[clave].errores || 0;
                }
            }

            // Si no hay datos, no mostrar
            if (totalAciertos === 0 && totalErrores === 0) continue;

            const total = totalAciertos + totalErrores;
            const porcentajeAsig =
                total > 0 ? Math.round((totalAciertos / total) * 100) : 0;

            const div = document.createElement("div");
            div.classList.add("asignatura-box");

            div.innerHTML = `
                <p><strong>${materia.toUpperCase()}</strong></p>
                <p>Aciertos: ${totalAciertos}</p>
                <p>Errores: ${totalErrores}</p>
                <p>Porcentaje: ${porcentajeAsig}%</p>
                <p>Completado: ${porcentajeAsig >= 70 ? "✔ Sí" : "✘ No"}</p>
            `;

            contenedor.appendChild(div);
        }
    }
}



// =====================================================
//  3. ACTIVAR CARGA AUTOMÁTICA DEL PROGRESO
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
