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
            ["dog", "assets/img/dog.png"],
            ["house", "assets/img/house.png"],
            ["apple", "assets/img/apple.png"]
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
            ["sol", "assets/img/sol.png"],
            ["luna", "assets/img/luna.png"],
            ["mar", "assets/img/mar.png"]
        ]
    }
};

let juegoActual = null;
let preguntaActual = null;
let asignaturaActual = null;
let modo = null;

let memoryCartas = [];
let memorySeleccion = [];

export function iniciarJuego(key) {
    asignaturaActual = key;
    juegoActual = Juegos[key];

    if (juegoActual.quiz) modo = "quiz";
    else if (juegoActual.silabas) modo = "silabas";
    else if (juegoActual.drag) modo = "drag";
    else if (juegoActual.memory) modo = "memory";
    else modo = "texto";

    generarPregunta();
}

function barajar(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generarPregunta() {
    document.getElementById("pregunta").innerHTML = "";
    document.getElementById("zona").innerHTML = "";
    document.getElementById("resultado").innerText = "";

    /* ---------------- MEMORY ---------------- */
    if (modo === "memory") {
        const base = juegoActual.memory;
        let lista = [];

        base.forEach(([txt, img]) => {
            lista.push({ tipo: "txt", valor: txt });
            lista.push({ tipo:Each((c, i) => {
            html += `<div class="memory-card" id="c${i}" onclick="clickMemory(${i})"></div>`;
        });

        document.getElementById("pregunta").innerHTML = html;
        return;
    }

    /* ---------------- TEXTO ---------------- */
    if (modo === "texto") {
        preguntaActual = juegoActual.preguntas
            ? juegoActual.preguntas[Math.floor(Math.random() * juegoActual.preguntas.length)]
            : juegoActual.generar();

        document.getElementById("pregunta").innerText = preguntaActual.p;
        return;
    }

    /* ---------------- QUIZ ---------------- */
    if (modo === "quiz") {
        const q = juegoActual.quiz[Math.floor(Math.random() * juegoActual.quiz.length)];
        preguntaActual = q;

        let html = q.p + "<br>";
        barajar(q.o).forEach(op => {
            html += `<button onclick="comprobarQuiz('${op}')">${op}</button>`;
        });

        document.getElementById("pregunta").innerHTML = html;
        return;
    }

    /* ---------------- SÍLABAS ---------------- */
    if (modo === "silabas") {
        const s = juegoActual.silabas[Math.floor(Math.random() * juegoActual.silabas.length)];
        preguntaActual = s;

        let html = "Ordena las sílabas:<br><div id='zona'></div><br>";

        barajar([...s.p]).forEach(si => {
            html += `<button onclick="agregarSilaba('${si}')">${si}</button>`;
        });

        document.getElementById("pregunta").innerHTML = html;
        return;
    }

    /* ---------------- DRAG ---------------- */
    if (modo === "drag") {
        let html = "";

        juegoActual.drag.forEach(obj => {
            html += `
                <div class="dragitem">
                    ${obj.img}
                    <div class="dropzone" ondrop="drop(event,'${obj.palabra}')" ondragover="event.preventDefault();"></div>
                </div>
                <button draggable="true" ondragstart="drag(event,'${obj.palabra}')">${obj.palabra}</button>
            `;
        });

        document.getElementById("pregunta").innerHTML = html;
        return;
    }
}

/* ------------------------------------------------------------------------
   TEXTO
------------------------------------------------------------------------ */

export function comprobar() {
    if (modo !== "texto") return;
    const inp = document.getElementById("respuesta").value.trim().toLowerCase();
    const ok = preguntaActual.r.toLowerCase();
    guardarProgreso(asignaturaActual, inp === ok ? 1 : 0, inp !== ok ? 1 : 0);
    document.getElementById("resultado").innerText = inp === ok ? "Correcto!" : "Incorrecto";
    document.getElementById("respuesta").value = "";
    setTimeout(generarPregunta, 700);
}

window.comprobar = comprobar;

/* ------------------------------------------------------------------------
   QUIZ
------------------------------------------------------------------------ */

window.comprobarQuiz = (o) => {
    guardarProgreso(asignaturaActual, o === preguntaActual.r ? 1 : 0, o !== preguntaActual.r ? 1 : 0);
    document.getElementById("resultado").innerText = o === preguntaActual.r ? "Correcto!" : "Incorrecto";
    setTimeout(generarPregunta, 700);
};

/* ------------------------------------------------------------------------
   SÍLABAS
------------------------------------------------------------------------ */

let palabraConstruida = "";

window.agregarSilaba = (si)=>{
    palabraConstruida += si;
    document.getElementById("zona").innerText = palabraConstruida;
    if (palabraConstruida.length >= preguntaActual.r.length) {
        guardarProgreso(asignaturaActual,
            palabraConstruida === preguntaActual.r ? 1 : 0,
            palabraConstruida !== preguntaActual.r ? 1 : 0
        );
        palabraConstruida = "";
        setTimeout(generarPregunta, 700);
    }
};

/* ------------------------------------------------------------------------
   MEMORY
------------------------------------------------------------------------ */

window.clickMemory = (i) => {
    const carta = memoryCartas[i];
    const elem = document.getElementById("c"+i);

    if (!elem.dataset.destapada) {
        elem.dataset.destapada = "1";
        elem.innerHTML = carta.valor;
        memorySeleccion.push({ i, carta });
    }

    if (memorySeleccion.length === 2) {
        const [a, b] = memorySeleccion;

        const match =
            (a.carta.tipo === "txt" && b.carta.tipo === "img" && a.carta.valor === b.carta.txt) ||
            (b.carta.tipo === "txt" && a.carta.tipo === "img" && b.carta.valor === a.carta.txt);

        if (match) {
            setTimeout(() => {
                document.getElementById("c"+a.i).style.visibility = "hidden";
                document.getElementById("c"+b.i).style.visibility = "hidden";
            }, 400);
        } else {
            setTimeout(() => {
                document.getElementById("c"+a.i).innerHTML = "";
                document.getElementById("c"+b.i).innerHTML = "";
                delete document.getElementById("c"+a.i).dataset.destapada;
                delete document.getElementById("c"+b.i).dataset.destapada;
            }, 600);
        }

        setTimeout(() => { memorySeleccion = []; }, 700);
    }
};

/* ------------------------------------------------------------------------
   DRAG & DROP
------------------------------------------------------------------------ */

window.drag = (e,p)=>{
    e.dataTransfer.setData("t",p);
};

window.drop = (e,p)=>{
    const t = e.dataTransfer.getData("t");
    guardarProgreso(asignaturaActual, t === p ? 1 : 0, t !== p ? 1 : 0);
    generarPregunta();
};

window.iniciarJuego = iniciarJuego;
