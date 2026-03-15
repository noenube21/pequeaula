// ======================================================
//  ⭐ JUEGOS MASTER - ARCHIVO ÚNICO
//  Contiene:
//  ✔ Motor general de juegos
//  ✔ Guardado de progreso
//  ✔ Múltiples asignaturas
//  ✔ Fácil de extender
// ======================================================

// ======================================================
//  IMPORTS
// ======================================================
import { auth, db } from "../firebase-config.js";
import {
    doc,
    updateDoc,
    getDoc,
    setDoc,
    increment
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// ======================================================
//  ⭐ SISTEMA DE PROGRESO (GENERAL)
// ======================================================
export async function guardarProgreso(asignatura, aciertos, errores) {
    const user = auth.currentUser;
    if (!user) {
        console.warn("⚠ No hay usuario logeado. No se guarda progreso.");
        return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    let datosPrevios = snap.exists() ? snap.data() : {};

    // Crear estructura si no existe
    if (!datosPrevios.progreso) datosPrevios.progreso = {};
    if (!datosPrevios.progreso[asignatura]) {
        datosPrevios.progreso[asignatura] = {
            puntos: 0,
            completado: false
        };
    }

    // Guardar datos actualizados
    await setDoc(ref, {
        partidas: increment(1),
        aciertos: increment(aciertos),
        errores: increment(errores),
        progreso: {
            ...datosPrevios.progreso,
            [asignatura]: {
                puntos: (datosPrevios.progreso[asignatura].puntos || 0) + aciertos,
                completado: aciertos > errores
            }
        }
    }, { merge: true });

    console.log(`✔ Progreso guardado en ${asignatura}:`, aciertos, errores);
}



// ======================================================
//  ⭐ MOTOR GENERAL DE JUEGOS
// ======================================================

export const Juegos = {
    castellano: {
        preguntas: [
            { p: "C__sa", r: "casa" },
            { p: "Pe__o", r: "perro" },
            { p: "Ma__o", r: "mango" },
            { p: "Li__o", r: "libro" },
            { p: "Pa__el", r: "papel" }
        ],
        tipo: "palabra-incompleta"
    },

    ingles: {
        preguntas: [
            { p: "House", r: "casa" },
            { p: "Dog", r: "perro" },
            { p: "Apple", r: "manzana" }
        ],
        tipo: "traduccion"
    },

    matematicas1: {
        tipo: "suma",
        generar: () => {
            let a = Math.floor(Math.random() * 10);
            let b = Math.floor(Math.random() * 10);
            return { p: `${a} + ${b}`, r: (a + b).toString() };
        }
    },

    matematicas2: {
        tipo: "resta",
        generar: () => {
            let a = Math.floor(Math.random() * 15 + 5);
            let b = Math.floor(Math.random() * 10);
            return { p: `${a} - ${b}`, r: (a - b).toString() };
        }
    },

    matematicas3: {
        tipo: "multiplicacion",
        generar: () => {
            let a = Math.floor(Math.random() * 10);
            let b = Math.floor(Math.random() * 10);
            return { p: `${a} × ${b}`, r: (a * b).toString() };
        }
    },

    ciencias: {
        preguntas: [
            { p: "¿Cuál es el planeta rojo?", r: "marte" },
            { p: "¿Qué gas respiramos?", r: "oxígeno" }
        ],
        tipo: "pregunta"
    }
};



// ======================================================
//  ⭐ INICIAR UN JUEGO
// ======================================================
let juegoActual = null;
let preguntaActual = null;
let asignaturaActual = null;

export function iniciarJuego(asignatura) {
    asignaturaActual = asignatura;
    juegoActual = Juegos[asignatura];

    console.log("🎮 Juego iniciado:", asignatura);

    generarPregunta();
}



// ======================================================
//  ⭐ GENERAR PREGUNTA (para cualquier tipo de juego)
// ======================================================
export function generarPregunta() {
    if (!juegoActual) return;

    let pregunta;

    // Tipo 1: lista fija
    if (juegoActual.preguntas) {
        pregunta = juegoActual.preguntas[
            Math.floor(Math.random() * juegoActual.preguntas.length)
        ];
    }

    // Tipo 2: generada automáticamente (mates)
    else if (juegoActual.generar) {
        pregunta = juegoActual.generar();
    }

    preguntaActual = pregunta;

    // Mostrar en HTML
    document.getElementById("pregunta").innerText = pregunta.p;
}



// ======================================================
//  ⭐ COMPROBAR RESPUESTA
// ======================================================
export function comprobar() {
    const input = document.getElementById("respuesta").value.trim().toLowerCase();
    const correcta = preguntaActual.r.toLowerCase();

    let acierto = input === correcta ? 1 : 0;
    let error = input !== correcta ? 1 : 0;

    // Mostrar en pantalla
    const res = document.getElementById("resultado");
    res.innerText = acierto ? "¡Correcto!" : `Incorrecto. Era ${correcta}`;
    res.style.color = acierto ? "green" : "red";

    // Guardar progreso
    guardarProgreso(asignaturaActual, acierto, error);

    // Limpiar
    document.getElementById("respuesta").value = "";

    // Siguiente pregunta
    setTimeout(() => generarPregunta(), 700);
}


// ======================================================
//  ⭐ HACER ACCESIBLE AL HTML
// ======================================================
window.iniciarJuego = iniciarJuego;
window.comprobar = comprobar;
