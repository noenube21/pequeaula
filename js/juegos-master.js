import { auth, db } from "../firebase-config.js";
import {
    doc, updateDoc, getDoc, setDoc, increment
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { comprobarRecompensas } from "./recompensas.js";

async function guardarProgreso(asignatura, aciertos, errores) {
    const u = auth.currentUser;
    if (!u) return;
    const ref = doc(db, "usuarios", u.uid);
    const snap = await getDoc(ref);
    let d = snap.exists() ? snap.data() : {};
    if (!d.progreso) d.progreso = {};
    if (!d.progreso[asignatura]) {
        d.progreso[asignatura] = { puntos: 0, completado: false };
    }
    await setDoc(ref, {
        partidas: increment(1),
        aciertos: increment(aciertos),
        errores: increment(errores),
        progreso: {
            ...d.progreso,
            [asignatura]: {
                puntos: (d.progreso[asignatura].puntos || 0) + aciertos,
                completado: aciertos > errores
            }
        }
    }, { merge: true });

    const tot = (d.aciertos || 0) + aciertos;
    await comprobarRecompensas(tot);

    const puntosTotales = ((d.aciertos || 0) + aciertos) - ((d.errores || 0) + errores);
    const nivel = Math.max(1, Math.floor(puntosTotales / 10));
    await updateDoc(ref, { nivel });
}

export const Juegos = {
    castellano: {
        preguntas: [
            { p: "C__sa", r: "casa" },
            { p: "Pe__o", r: "perro" },
            { p: "Ma__o", r: "mango" },
            { p: "Li__o", r: "libro" },
            { p: "Pa__el", r: "papel" }
        ]
    },
    ingles: {
        preguntas: [
            { p: "House", r: "casa" },
            { p: "Dog", r: "perro" },
            { p: "Apple", r: "manzana" }
        ]
    },
    matematicas1: {
        generar: () => {
            const a = Math.floor(Math.random() * 10);
            const b = Math.floor(Math.random() * 10);
            return { p: `${a} + ${b}`, r: (a + b).toString() };
        }
    },
    matematicas2: {
        generar: () => {
            const a = Math.floor(Math.random() * 10 + 5);
            const b = Math.floor(Math.random() * 10);
            return { p: `${a} - ${b}`, r: (a - b).toString() };
        }
    },
    matematicas3: {
        generar: () => {
            const a = Math.floor(Math.random() * 10);
            const b = Math.floor(Math.random() * 10);
            return { p: `${a} × ${b}`, r: (a * b).toString() };
        }
    },
    ciencias: {
        preguntas: [
            { p: "Planeta rojo", r: "marte" },
            { p: "Gas que respiramos", r: "oxígeno" }
        ]
    }
};

let juegoActual = null;
let preguntaActual = null;
let asignaturaActual = null;

export function iniciarJuego(asignatura) {
    asignaturaActual = asignatura;
    juegoActual = Juegos[asignatura];
    generarPregunta();
}

export function generarPregunta() {
    if (!juegoActual) return;
    let q = null;
    if (juegoActual.preguntas) {
        q = juegoActual.preguntas[Math.floor(Math.random() * juegoActual.preguntas.length)];
    } else if (juegoActual.generar) {
        q = juegoActual.generar();
    }
    preguntaActual = q;
    document.getElementById("pregunta").innerText = q.p;
}

export function comprobar() {
    const inp = document.getElementById("respuesta").value.trim().toLowerCase();
    const ok = preguntaActual.r.toLowerCase();
    let a = inp === ok ? 1 : 0;
    let e = inp !== ok ? 1 : 0;
    document.getElementById("resultado").innerText = inp === ok ? "Correcto" : "Incorrecto";
    guardarProgreso(asignaturaActual, a, e);
    document.getElementById("respuesta").value = "";
    setTimeout(() => generarPregunta(), 500);
}

window.iniciarJuego = iniciarJuego;
window.comprobar = comprobar;
