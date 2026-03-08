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
// JUEGO DE CASTELLANO
// ------------------------------

const palabrasCast = [
    { pregunta: "C__sa", respuesta: "casa" },
    { pregunta: "Pe__o", respuesta: "perro" },
    { pregunta: "Ma__o", respuesta: "mango" },
    { pregunta: "Li__o", respuesta: "libro" },
    { pregunta: "Pa__el", respuesta: "papel" }
];

let palabraActualCast;

function generarPreguntaCastellano() {
    palabraActualCast = palabrasCast[Math.floor(Math.random() * palabrasCast.length)];
    document.getElementById("preguntaCast").innerText =
        "Completa la palabra: " + palabraActualCast.pregunta;
}

window.generarPreguntaCastellano = generarPreguntaCastellano;

function comprobarCastellano() {
    const respuesta = document.getElementById("respuestaCast").value.toLowerCase();
    const resultado = document.getElementById("resultadoCast");

    let acierto = 0;
    let error = 0;

    if (respuesta === palabraActualCast.respuesta) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";
        acierto = 1;
    } else {
        resultado.innerText = "Incorrecto. Era: " + palabraActualCast.respuesta;
        resultado.style.color = "red";
        error = 1;
    }

    // Guardar en Firebase
    guardarResultado(acierto, error);

    document.getElementById("respuestaCast").value = "";
    generarPreguntaCastellano();
}

window.comprobarCastellano = comprobarCastellano;

