// =====================================================
//  🔵  IMPORTS (LOS CORRECTOS PARA TU VERSIÓN DE FIREBASE)
// =====================================================
import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
//  🔵  1. GUARDAR RESULTADOS DE LOS JUEGOS
// =====================================================
// Se llama desde los juegos: registrarResultado("matematicas", aciertos, errores)
export async function registrarResultado(asignatura, correctas, incorrectas) {
    const user = auth.currentUser;
    if (!user) {
        console.warn("⚠ No hay usuario logeado. No se puede guardar progreso.");
        return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    // Cargar datos anteriores
    let datos = snap.exists() ? snap.data() : {};

    // Totales globales
    const partidasTotales = (datos.partidas || 0) + 1;
    const aciertosTotales = (datos.aciertos || 0) + correctas;
    const erroresTotales = (datos.errores || 0) + incorrectas;

    // Progreso por asignatura
    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            puntos: 0,
            completado: false,
        };
    }

    // Sumar puntos
    datos.progreso[asignatura].puntos += correctas;

    // Si acertó más de los que falló
    if (correctas > incorrectas) {
        datos.progreso[asignatura].completado = true;
    }

    // Guardar
    await setDoc(ref, {
        partidas: partidasTotales,
        aciertos: aciertosTotales,
        errores: erroresTotales,
        progreso: datos.progreso
    }, { merge: true });

    console.log("✔ Progreso actualizado en Firestore");
}



// =====================================================
//  🔵  2. ASIGNAR RECOMPENSAS AUTOMÁTICAS SEGÚN PORCENTAJE
// =====================================================
async function comprobarRecompensas(porcentaje) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);

    // Objeto con recompensas simples
    const recompensas = {};

    if (porcentaje >= 30) recompensas.moneda = true;     // 💰
    if (porcentaje >= 50) recompensas.estrella = true;   // ⭐
    if (porcentaje >= 70) recompensas.medalla = true;    // 🥇
    if (porcentaje >= 90) recompensas.trofeo = true;     // 🏆

    await updateDoc(ref, { recompensas }, { merge: true });

    console.log("🏅 Recompensas actualizadas:", recompensas);
}



// =====================================================
//  🔵  3. CARGAR PROGRESO EN PANTALLA
// =====================================================
async function cargarProgreso() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const datos = snap.data();

    // Datos generales
    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    // Cálculo de porcentaje global
    const porcentaje = partidas > 0
        ? Math.round((aciertos / partidas) * 100)
        : 0;

    // Pintar valores
    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";

    // Dar recompensas si toca
    comprobarRecompensas(porcentaje);

    // Progreso por asignatura
    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    if (datos.progreso) {
        for (const asignatura in datos.progreso) {
            const info = datos.progreso[asignatura];

            const div = document.createElement("div");
            div.classList.add("asignatura-box");

            div.innerHTML = `
                <p><strong>${asignatura.toUpperCase()}</strong></p>
                <p>Puntos: ${info.puntos || 0}</p>
                <p>Completado: ${info.completado ? "Sí" : "No"}</p>
            `;

            contenedor.appendChild(div);
        }
    }
}



// =====================================================
//  🔵  4. ESPERAR A QUE EL USUARIO SE LOGUEE Y CARGAR
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
