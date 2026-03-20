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

    // Si no existe la asignatura, crearla
    if (!datos.progreso[asignatura]) {
        datos.progreso[asignatura] = {
            aciertos: 0,
            errores: 0
        };
    }

    // Añadir aciertos y errores
    datos.progreso[asignatura].aciertos += correctas;
    datos.progreso[asignatura].errores += incorrectas;

    await setDoc(ref, {
        progreso: datos.progreso
    }, { merge: true });
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

    // ---- TOTALES GENERALES (superiores) ----
    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;
    const porcentaje =
        partidas > 0 ? Math.round(aciertos / partidas * 100) : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";


    // ---- AGRUPAR CLAVES (DETECTANDO NIVEL 1,2,3) ----
    const grupos = {
        matematicas: ["matematicas1","matematicas2","matematicas3","matematicas"],
        castellano: ["castellano1","castellano2","castellano3","castellano"],
        ingles:     ["ingles1","ingles2","ingles3","ingles"],
        ciencias:   ["ciencias1","ciencias2","ciencias3","ciencias"]
    };

    // ---- ORDEN REAL QUE TÚ QUIERES ----
    const orden = ["matematicas", "castellano", "ingles", "ciencias"];

    const contenedor = document.getElementById("progresoAsignaturas");
    contenedor.innerHTML = "";

    // ---- MOSTRAR RESULTADOS ----
    for (const materia of orden) {

        let aciertosSum = 0;
        let erroresSum = 0;
        let tieneDatos = false;

        grupos[materia].forEach(nombre => {
            if (datos.progreso && datos.progreso[nombre]) {
                aciertosSum += datos.progreso[nombre].aciertos || 0;
                erroresSum  += datos.progreso[nombre].errores  || 0;
                tieneDatos = true;
            }
        });

        if (!tieneDatos) continue;

        const total = aciertosSum + erroresSum;
        const porcentajeMat =
            total > 0 ? Math.round(aciertosSum / total * 100) : 0;

        const div = document.createElement("div");
        div.classList.add("asignatura-box");

        div.innerHTML = `
            <p><strong>${materia.toUpperCase()}</strong></p>
            <p>Aciertos: ${aciertosSum}</p>
            <p>Errores: ${erroresSum}</p>
            <p>Porcentaje: ${porcentajeMat}%</p>
        `;

        contenedor.appendChild(div);
    }
}



// =====================================================
// 3. ACTIVAR CARGA AUTOMÁTICA AL ENTRAR
// =====================================================
auth.onAuthStateChanged((u) => {
    if (u) cargarProgreso();
});
