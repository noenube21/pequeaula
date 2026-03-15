// =====================================================
//  🔵  IMPORTS (LOS CORRECTOS PARA TU VERSIÓN DE FIREBASE)
// =====================================================
import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
//  🔵  1. FUNCIÓN NUEVA: GUARDAR RESULTADOS DE LOS JUEGOS
// =====================================================
// Se llama desde cada juego: registrarResultado("matematicas", correctas, incorrectas)
export async function registrarResultado(asignatura, correctas, incorrectas) {
    const user = auth.currentUser;
    if (!user) {
        console.warn("⚠ No hay usuario logeado. No se puede guardar progreso.");
        return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    // Cargar datos existentes o crear nuevos
    let datos = snap.exists() ? snap.data() : {};

    // Valores generales
    const partidasTotales = (datos.partidas || 0) + 1;
    const aciertosTotales = (datos.aciertos || 0) + correctas;
    const erroresTotales = (datos.errores || 0) + incorrectas;

    // Objeto de progreso por asignatura
    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            puntos: 0,
            completado: false,
        };
    }

    // Sumar puntos
    datos.progreso[asignatura].puntos += correctas;

    // Si acertó más que falló, marcamos como completado
    if (correctas > incorrectas) {
        datos.progreso[asignatura].completado = true;
    }

    // Guardar en Firestore
    await setDoc(ref, {
        partidas: partidasTotales,
        aciertos: aciertosTotales,
        errores: erroresTotales,
        progreso: datos.progreso
    }, { merge: true });

    console.log("✔ Progreso actualizado en Firestore (colección 'usuarios').");
}



// =====================================================
//  🔵  2. FUNCIÓN QUE YA TENÍAS: CARGAR EL PROGRESO
// =====================================================
async function cargarProgreso() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const datos = snap.data();

    // Valores generales
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
//  🔵  3. MANTENER TU LÍNEA ORIGINAL DE ESCUCHAR LOGIN
// =====================================================
auth.onAuthStateChanged(() => cargarProgreso());
