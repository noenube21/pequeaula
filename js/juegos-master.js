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
    if (!d.progreso[asignatura]) d.progreso[asignatura] = { puntos: 0, completado: false };

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

const Juegos = {

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

    castellano1: {
        preguntas: [
            { p: "C__sa", r: "casa" },
            { p: "Pe__o", r: "perro" },
            { p: "Ma__o", r: "mango" },
            { p: "Li__o", r: "libro" },
            { p: "Pa__el", r: "papel" }
        ]
    },

    castellano2: {
        silabas: [
            { p: ["ca", "sa"], r: "casa" },
            { p: ["pe", "rro"], r: "perro" },
            { p: ["li", "bro"], r: "libro" }
        ]
    },

    castellano3: {
        quiz: [
            { p: "¿Cuál es un sustantivo?", o: ["correr", "mesa", "rápido", "allí"], r: "mesa" },
            { p: "¿Cuál es un verbo?", o: ["perro", "cantar", "frío", "taza"], r: "cantar" }
        ]
    },

    ingles1: {
        preguntas: [
            { p: "House", r: "casa" },
            { p: "Dog", r: "perro" },
            { p: "Apple", r: "manzana" }
        ]
    },

    ingles2: {
        quiz: [
            { p: "Cat = ?", o: ["gato", "perro", "libro", "mesa"], r: "gato" },
            { p: "Book = ?", o: ["cielo", "manzana", "libro", "pez"], r: "libro" }
        ]
    },

    ingles3: {
        memory: [
            ["dog","assets/img/dog.png"],
            ["house","assets/img/house.png"],
            ["apple","assets/img/apple.png"]
        ]
    },

    ciencias1: {
        preguntas: [
            { p: "Planeta rojo", r: "marte" },
            { p: "Gas que respiramos", r: "oxígeno" }
        ]
    },

    ciencias2: {
        drag: [
            { palabra: "Sol", img: "assets/img/sol.png" },
            { palabra: "Árbol", img: "assets/img/arbol.png" }
        ]
    },

    ciencias3: {
        memory: [
            ["sol","assets/img/sol.png"],
            ["luna","assets/img/luna.png"],
            ["mar","assets/img/mar.png"]
        ]
    }
};

let juegoActual = null;
let preguntaActual = null;
let asignaturaActual = null;
let modo = "texto";
let opcionesActuales = [];
let silabasActuales = [];
let memoryCartas = [];
let memorySeleccion = [];

export function iniciarJuego(key) {
