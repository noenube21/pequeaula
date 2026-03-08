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
// JUEGO DE INGLÉS
// ------------------------------

const vocabularioIng = [
    { pregunta: "Cat", respuesta: "gato" },
    { pregunta: "Dog", respuesta: "perro" },
    { pregunta: "House", respuesta: "casa" },
    { pregunta: "Sun", respuesta: "sol" },
    { pregunta: "Water", respuesta: "agua" }
];

let palabraActualIng;

function generarPreguntaIngles() {
    palabraActualIng = vocabularioIng[Math.floor(Math.random() * vocabularioIng.length)];
    document.getElementById("preguntaIng").innerText =
        "Traduce al español: " + palabraActualIng.pregunta;
}

function comprobarIngles() {
    const respuesta = document.getElementById("respuestaIng").value.toLowerCase();
    const resultado = document.getElementById("resultadoIng");

    let acierto = 0;
    let error = 0;

    if (respuesta === palabraActualIng.respuesta) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";
        acierto = 1;
    } else {
        resultado.innerText = "Incorrecto. Era: " + palabraActualIng.respuesta;
        resultado.style.color = "red";
        error = 1;
    }

    // Guardar en Firebase
    guardarResultado(acierto, error);

    document.getElementById("respuestaIng").value = "";
    generarPreguntaIngles();
}

// 👉 Hacemos la función global para el botón
window.comprobarIngles = comprobarIngles;

// 👉 Generamos la primera pregunta automáticamente
generarPreguntaIngles();
