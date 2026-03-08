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
// JUEGO DE MATEMÁTICAS
// ------------------------------

let num1, num2;

function generarPregunta() {
    num1 = Math.floor(Math.random() * 10);
    num2 = Math.floor(Math.random() * 10);

    document.getElementById("pregunta").innerText =
        `¿Cuánto es ${num1} + ${num2}?`;
}

function comprobar() {
    const respuesta = parseInt(document.getElementById("respuesta").value);
    const resultado = document.getElementById("resultadoJuego");

    let acierto = 0;
    let error = 0;

    if (respuesta === num1 + num2) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";
        acierto = 1;
    } else {
        resultado.innerText = `Incorrecto. Era ${num1 + num2}`;
        resultado.style.color = "red";
        error = 1;
    }

    // Guardar en Firebase
    guardarResultado(acierto, error);

    document.getElementById("respuesta").value = "";
    generarPregunta();
}

// 👉 Hacemos la función global para el botón
window.comprobar = comprobar;

// 👉 Generamos la primera pregunta automáticamente
generarPregunta();

