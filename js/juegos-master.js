import { auth, db } from "../firebase-config.js";
import {
    doc, updateDoc, getDoc, setDoc, increment
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { comprobarRecompensas } from "./recompensas.js";

// ================== GUARDAR PROGRESO ==================
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

// ================== JUEGOS ==================
const Juegos = {
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

// ================== VARIABLES ==================
let juegoActual = null;
let asignaturaActual = null;
let memoryCartas = [];
let memorySeleccion = [];

// ================== INICIAR ==================
export function iniciarJuego(key) {
    asignaturaActual = key;
    juegoActual = Juegos[key];

    const contenedor = document.getElementById("pregunta");
    contenedor.innerHTML = "";

    if (juegoActual.memory) {
        memoryCartas = [...juegoActual.memory, ...juegoActual.memory];
        memoryCartas.sort(() => Math.random() - 0.5);
        mostrarMemory();
    }
}

// ================== MOSTRAR ==================
function mostrarMemory() {
    const contenedor = document.getElementById("pregunta");
    contenedor.innerHTML = "";

    memorySeleccion = [];

    memoryCartas.forEach((carta) => {
        const div = document.createElement("div");
        div.classList.add("carta");

        const img = document.createElement("img");
        img.src = carta[1];
        img.style.display = "none";

        div.appendChild(img);

        div.addEventListener("click", () => voltearCarta(div, img, carta));

        contenedor.appendChild(div);
    });
}

// ================== LÓGICA ==================
function voltearCarta(div, img, carta) {
    if (memorySeleccion.length === 2) return;

    img.style.display = "block";
    memorySeleccion.push({ div, img, carta });

    if (memorySeleccion.length === 2) {
        const [c1, c2] = memorySeleccion;

        if (c1.carta[0] === c2.carta[0]) {
            memorySeleccion = [];
        } else {
            setTimeout(() => {
                c1.img.style.display = "none";
                c2.img.style.display = "none";
                memorySeleccion = [];
            }, 800);
        }
    }
}
