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

("pregunta").innerHTML = "";
    document.getElementById("resultado").innerText = "";
    document.getElementById("zona").innerHTML = "";

    if (modo === "texto") {
        if (juegoActual.preguntas) {
            preguntaActual = juegoActual.preguntas[Math.floor(Math.random() * juegoActual.preguntas.length)];
        } else {
            preguntaActual = juegoActual.generar();
        }
        document.getElementById("pregunta").innerText = preguntaActual.p;
        return;
    }

    if (modo === "quiz") {
        const q = juegoActual.quiz[Math.floor(Math.random() * juegoActual.quiz.length)];
        preguntaActual = q;
        document.getElementById("pregunta").innerHTML = q.p;

        opcionesActuales = [...q.o];
        barajar(opcionesActuales);

        let html = "";
        opcionesActuales.forEach((op) => {
            html += `<button onclick="comprobarQuiz('${op}')">${op}</button>`;
        });
        document.getElementById("pregunta").innerHTML += "<br>" + html;
        return;
    }

    if (modo === "silabas") {
        const s = juegoActual.silabas[Math.floor(Math.random() * juegoActual.silabas.length)];
        preguntaActual = s;
        silabasActuales = barajar([...s.p]);
        let html = "";
        silabasActuales.forEach((si) => {
            html += `<button onclick="agregarSilaba('${si}')">${si}</button>`;
        });
        document.getElementById("pregunta").innerHTML =
            "Ordena las sílabas:<br><div id='zona'></div><br>" + html;
        return;
    }

    if (modo === "memory") {

        const base = juegoActual.memory;
        let lista = [];

        base.forEach(([txt, img]) => {
            lista.push({ tipo: "txt", valor: txt });
            lista.push({ tipo: "img", valor: `<img src="${img}" width="80" height="80">`, txt });
        });

        memoryCartas = barajar(lista);
        memorySeleccion = [];

        let html = "";
        memoryCartas.forEach((c, i) => {
            html += `<div class="memory-card" id="c${i}" onclick="clickMemory(${i})"></div>`;
        });

        document.getElementById("pregunta").innerHTML = html;
        return;
    }

    if (modo === "drag") {
        let html = "";
        juegoActual.drag.forEach((obj,i)=>{
            html += `
            <div class="dragitem">
                ${obj.img}
                <div class="dropzone" ondrop="drop(event,'${obj.palabra}')" ondragover="event.preventDefault();"></div>
            </div>
            <button draggable="true" ondragstart="drag(event,'${obj.palabra}')">${obj.palabra}</button>
            `;
        });
        document.getElementById("pregunta").innerHTML = html;
        preguntaActual = juegoActual.drag;
    }
}

export function comprobar() {
    if (modo !== "texto") return;
    const inp = document.getElementById("respuesta").value.trim().toLowerCase();
    const ok = preguntaActual.r.toLowerCase();
    let a = inp === ok ? 1 : 0;
    let e = inp !== ok ? 1 : 0;
    document.getElementById("resultado").innerText = a ? "Correcto!" : "Incorrecto";
    guardarProgreso(asignaturaActual, a, e);
    document.getElementById("respuesta").value="";
    setTimeout(generarPregunta, 700);
}

window.comprobar = comprobar;

window.comprobarQuiz = (o)=>{
    let a = o === preguntaActual.r ? 1 : 0;
    let e = o !== preguntaActual.r ? 1 : 0;
    document.getElementById("resultado").innerText = a ? "Correcto!" : "Incorrecto";
    guardarProgreso(asignaturaActual, a, e);
    setTimeout(generarPregunta, 700);
};

let palabraConstruida = "";
window.agregarSilaba = (si)=>{
    palabraConstruida += si;
    document.getElementById("zona").innerText = palabraConstruida;
    if (palabraConstruida.length >= preguntaActual.r.length) {
        let a = palabraConstruida === preguntaActual.r ? 1 : 0;
        let e = a ? 0 : 1;
        document.getElementById("resultado").innerText = a ? "Correcto!" : "Incorrecto";
        palabraConstruida = "";
        guardarProgreso(asignaturaActual, a, e);
        setTimeout(generarPregunta, 700);
    }
};

window.clickMemory = (i) => {
    const carta = memoryCartas[i];
    const elem = document.getElementById("c"+i);

    if (!elem.dataset.destapada) {
        elem.dataset.destapada = "1";
        elem.innerHTML = carta.valor;
        memorySeleccion.push({i, carta});
    }

    if (memorySeleccion.length === 2) {
        const [a, b] = memorySeleccion;

        const match =
            (a.carta.tipo === "txt" && b.carta.tipo === "img" && a.carta.valor === b.carta.txt) ||
            (b.carta.tipo === "txt" && a.carta.tipo === "img" && b.cartaf (match) {
            setTimeout(() => {
                document.getElementById("c"+a.i).style.visibility = "hidden";
                document.getElementById("c"+b.i).style.visibility = "hidden";
            }, 400);

            guardarProgreso(asignaturaActual,1,0);
        } else {
            setTimeout(() => {
                document.getElementById("c"+a.i).innerHTML = "";
                document.getElementById("c"+b.i).innerHTML = "";
                delete document.getElementById("c"+a.i).dataset.destapada;
                delete document.getElementById("c"+b.i).dataset.destapada;
            }, 500);

            guardarProgreso(asignaturaActual,0,1);
        }

        setTimeout(() => {
            memorySeleccion = [];
        }, 700);
    }
};

window.drag = (e,p)=>{ e.dataTransfer.setData("t",p); };
window.drop = (e,p)=>{
    const t = e.dataTransfer.getData("t");
    let a = t===p?1:0;
    let e2 = t!==p?1:0;
    guardarProgreso(asignaturaActual,a,e2);
    generarPregunta();
};

window.iniciarJuego = iniciarJuego;
