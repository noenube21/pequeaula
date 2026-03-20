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

    // Inicializar estructura si no existe
    if (!datos.progreso) datos.progreso = {};
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            aciertos: 0,
            errores: 0,
            completado: false
        };
    }

    // Sumar totales
    datos.progreso[asignatura].aciertos += correctas;
    datos.progreso[asignatura].errores += incorrectas;

    // Calcular porcentaje
    const total = datos.progreso[asignatura].aciertos + datos.progreso[asignatura].errores;
    const porcentaje = total > 0
        ? Math.round((datos.progreso[asignatura].aciertos / total) * 100)
        : 0;

    // COMPLETADO = 70%
    datos.progreso[asignatura].completado = porcentaje >= 70;

    // Guardar en Firestore
    await setDoc(ref, {
        progreso: datos.progreso
    }, { merge: true });

    console.log("✔ Progreso actualizado:", datos.progreso[asignatura]);
}



// =====================================================
//  2. CARGAR PROGRESO EN LA PÁGINA
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

    // Mostrar progreso por asignatura
    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    if (datos.progreso) {
        for (const asignatura in datos.progreso) {
            const info = datos.progreso[asignatura];

            const total = info.aciertos + info.errores;
            const porcentajeAsig =
                total > 0 ? Math.round((info.aciertos / total) * 100) : 0;

            const div = document.createElement("div");
            div.classList.add("asignatura-box");

            div.innerHTML = `
                <p><strong>${asignatura.toUpperCase()}</strong></p>
                <p>Aciertos: ${info.aciertos}</p>
                <p>Errores: ${info.errores}</p>
                <p>Porcentaje: ${porcentajeAsig}%</p>
                <p>Completado: ${info.completado ? "✔ Sí" : "✘ No"}</p>
            `;

            contenedor.appendChild(div);
        }
    }
}



// =====================================================
//  3. CARGAR AUTOMÁTICAMENTE AL ENTRAR
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
