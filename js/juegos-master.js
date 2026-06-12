import { comprobarRecompensas } from "./recompensas.js";

// =======================================
// ESTADO GLOBAL
// =======================================

let datosCargados = false;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let usadas = {};

// 🔥 PROGRESO ACTIVO
let datos = {
    aciertos: 0,
    puntosPorNivel: {},
    historial: []
};


// =======================================
// CARGAR DATOS USUARIO (SUPABASE + FALLBACK)
// =======================================

export async function cargarDatosUsuario() {

if (datosCargados) return;
datosCargados = true;

const email = window.auth?.currentUser?.email;

// RESET limpio
datos = {
    aciertos: 0,
    puntosPorNivel: {},
    historial: []
};

// ===============================
// SUPABASE (PRIORIDAD)
// ===============================
if (email && window.cargarProgresoSupabase) {

    const filas = await window.cargarProgresoSupabase(email);

    console.log("📦 SUPABASE FILAS:", filas);

    for (const fila of filas) {

        const nivel = fila.nivel || fila.juego;

        if (!nivel) continue;

        datos.puntosPorNivel[nivel] =
            Number(fila.puntos) || 0;
    }

    console.log("✅ DATOS CARGADOS:", datos);
}

// ===============================
// FALLBACK LOCAL (solo si no hay Supabase)
// ===============================
else {

    const local = JSON.parse(
        localStorage.getItem("progreso")
    );

    if (local?.puntosPorNivel) {
        datos.puntosPorNivel = local.puntosPorNivel;
    }
}

window.datos = datos;
}


// =======================================
// LIMPIAR TEXTO
// =======================================

function limpiar(t) {
return (t || "")
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.trim();
}


// =======================================
// LEVENSHTEIN
// =======================================

function levenshtein(a, b) {
const matrix = [];

for (let i = 0; i <= b.length; i++) matrix[i] = [i];
for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

for (let i = 1; i <= b.length; i++) {
for (let j = 1; j <= a.length; j++) {

if (b.charAt(i - 1) === a.charAt(j - 1)) {
matrix[i][j] = matrix[i - 1][j - 1];
} else {
matrix[i][j] = Math.min(
matrix[i - 1][j - 1] + 1,
matrix[i][j - 1] + 1,
matrix[i - 1][j] + 1
);
}
}
}

return matrix[b.length][a.length];
}


// =======================================
// PUNTOS
// =======================================

function obtenerPuntosNivel() {

if (!datos.puntosPorNivel[claveActual]) {
datos.puntosPorNivel[claveActual] = 0;
}

return datos.puntosPorNivel[claveActual];
}

function sumarPunto() {

if (!datos.puntosPorNivel[claveActual]) {
datos.puntosPorNivel[claveActual] = 0;
}

datos.puntosPorNivel[claveActual]++;

datos.historial.push({
nivel: claveActual,
fecha: Date.now()
});
}


// =======================================
// UI PUNTOS
// =======================================

function actualizarPuntos() {

const score = document.getElementById("score");

if (!score) return;

const global = Object.values(datos.puntosPorNivel || {})
.reduce((a, b) => a + (Number(b) || 0), 0);

score.innerHTML =
`Puntos: ${obtenerPuntosNivel()} | Global: ${global}`;
}


// =======================================
// GUARDAR TODO (SUPABASE + CACHE)
// =======================================

async function guardarTodo() {

localStorage.setItem("progreso", JSON.stringify(datos));

if (window.guardarProgreso) {

const email = window.auth?.currentUser?.email;

if (email) {

await window.guardarProgreso(
email,
claveActual,
claveActual,
obtenerPuntosNivel()
);
}
}
}


// =======================================
// JUEGOS (TU BLOQUE ORIGINAL SIN TOCAR)
// =======================================

const Juegos = {

matematicas1:{ generar:()=>calc("+",10) },
matematicas2:{ generar:()=>calc("-",20) },
matematicas3:{ generar:()=>calc("*",10) },

ingles1:{ preguntas:[] },
ingles2:{ preguntas:[] },
ingles3:{ preguntas:[] },

castellano1:{
 preguntas:[
  { p:"¿Cuál es un sustantivo?", r:"mesa", tipo:"test", opciones:["mesa","correr","rápido"] }
 ]
},

castellano2:{ preguntas:[] },
castellano3:{ preguntas:[] },

ciencias1:{ preguntas:[] },
ciencias2:{ preguntas:[] },
ciencias3:{ preguntas:[] },

valenciano1:{ preguntas:[] }
};


// =======================================
// INICIAR JUEGO (FIX IMPORTANTE)
// =======================================

export async function iniciarJuego(key) {

claveActual = key;

await cargarDatosUsuario();

// 🔥 FIX CRÍTICO
if (!Juegos[key]) {
console.error("❌ Juego no existe:", key);
return;
}

juegoActual = Juegos[key];

const pregunta = document.getElementById("pregunta");
const zona = document.getElementById("zona");
const input = document.getElementById("respuesta");
const resultado = document.getElementById("resultado");

pregunta.innerText = "";
zona.innerHTML = "";
resultado.innerHTML = "";
input.value = "";

actualizarPuntos();

if (juegoActual.generar) {

const gen = juegoActual.generar();

preguntaActual = {
p: gen.p,
r: String(gen.r),
tipo: "input"
};

} else {

let lista = juegoActual.preguntas || [];

if (!usadas[key]) usadas[key] = new Set();

let disponibles = lista.filter(p => !usadas[key].has(p.p));

if (disponibles.length === 0) {
usadas[key].clear();
disponibles = [...lista];
}

preguntaActual =
disponibles[Math.floor(Math.random() * disponibles.length)];

usadas[key].add(preguntaActual.p);
}

pregunta.innerText = preguntaActual.p;

input.style.display =
(preguntaActual.tipo === "input") ? "block" : "none";

zona.innerHTML = "";

if (preguntaActual.tipo === "test") {

preguntaActual.opciones.forEach(op => {

const b = document.createElement("button");

b.innerText = op;
b.classList.add("opcion");

b.onclick = () => {

document.querySelectorAll("#zona .opcion")
.forEach(btn => btn.classList.remove("seleccionada"));

b.classList.add("seleccionada");
input.value = op;
};

zona.appendChild(b);
});
}
}


// =======================================
// COMPROBAR RESPUESTA
// =======================================

export async function comprobar() {

const r = limpiar(document.getElementById("respuesta").value);
const ok = limpiar(preguntaActual.r);

const resultado = document.getElementById("resultado");

const correcto = levenshtein(r, ok) <= 1;

if (correcto) {
sumarPunto();
datos.aciertos++;
resultado.innerText = "✔ Correcto";
} else {
resultado.innerText = "✘ Incorrecto. Respuesta correcta: " + preguntaActual.r;
}

actualizarPuntos();
await guardarTodo();

setTimeout(() => {
iniciarJuego(claveActual);
}, 500);
}
