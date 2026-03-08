// ------------------------------
// IMPORTS PARA GUARDAR PROGRESO
// ------------------------------
import { auth, db } from "../firebase-config.js";
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Función para guardar resultados en Firebase
async function guardarResultado(aciertos, errores) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);

    await updateDoc(ref, {
        partidas: increment(1),
        aciertos: increment(aciertos),
        errores: increment(errores)
    });
}

// ------------------------------
// JUEGO DE CIENCIAS
// ------------------------------

const preguntasCiencias = [
    { pregunta: "¿Qué astro ilumina la Tierra?", respuesta: "sol" },
    { pregunta: "¿Cómo se llama el satélite de la Tierra?", respuesta: "luna" },
    { pregunta: "¿Qué necesitamos para respirar?", respuesta: "aire" },
    { pregunta: "¿Qué animal pone huevos?", respuesta: "gallina" },
    { pregunta: "¿Qué órgano bombea la sangre?", respuesta: "corazón" }
];

let preguntaActualCiencias;

function generarPreguntaCiencias() {
    preguntaActualCiencias = preguntasCiencias[Math.floor(Math.random() * preguntasCiencias.length)];
    document.getElementById("preguntaCiencias").innerText = preguntaActualCiencias.pregunta;
}

function comprobarCiencias() {
    const respuesta = document.getElementById("respuestaCiencias").value.toLowerCase();
    const resultado = document.getElementById("resultadoCiencias");

    let acierto = 0;
    let error = 0;

    if (respuesta === preguntaActualCiencias.respuesta) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";
        acierto = 1;
    } else {
        resultado.innerText = "Incorrecto. Era: " + preguntaActualCiencias.respuesta;
        resultado.style.color = "red";
        error = 1;
    }

    // Guardar en Firebase
    guardarResultado(acierto, error);

    document.getElementById("respuestaCiencias").value = "";
    generarPreguntaCiencias();
}

// 👉 Hacemos la función global para el botón
window.comprobarCiencias = comprobarCiencias;

// 👉 Generamos la primera pregunta automáticamente
generarPreguntaCiencias();

