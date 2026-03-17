import { auth, db } from "../firebase-config.js";
import {
    doc, getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

    ingles3: {
        memory: [
            ["dog","/assets/img/dog.png"],
            ["house","/assets/img/house.png"],
            ["apple","/assets/img/apple.png"]
        ]
    },

    ciencias3: {
        memory: [
            ["sol","/assets/img/sol.png"],
            ["luna","/assets/img/luna.png"],
            ["mar","/assets/img/mar.png"]
        ]
    }
};

let juegoActual = null;
let asignaturaActual = null;

export function iniciarJuego(key) {
    asignaturaActual = key;
    juegoActual = Juegos[key];

    const contenedor = document.getElementById("pregunta");

    // TEXTOS
    if (juegoActual.generar) {
        const q = juegoActual.generar();
        contenedor.innerText = q.p;

        window.comprobar = () => {
            const resp = document.getElementById("respuesta").value.trim();
            document.getElementById("resultado").innerText =
                resp === q.r ? "Correcto" : "Incorrecto";
        };
    }

    // MEMORY ORIGINAL
    if (juegoActual.memory) {
        contenedor.innerHTML = "";
        const zona = document.getElementById("zona");
        zona.innerHTML = "";

        let cartas = [...juegoActual.memory, ...juegoActual.memory];
        cartas.sort(() => Math.random() - 0.5);

        cartas.forEach(carta => {
            const div = document.createElement("div");
            div.classList.add("carta");

            const img = document.createElement("img");
            img.src = carta[1];
            img.style.display = "none";

            div.appendChild(img);
            div.addEventListener("click", () => {
                img.style.display = "block";
            });

            zona.appendChild(div);
        });
    }
}
``
