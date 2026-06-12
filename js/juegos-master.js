import { comprobarRecompensas } from "./recompensas.js";

// =======================================
// ESTADO GLOBAL
// =======================================

let datosCargados = false;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let usadas = {};

// 🔥 ESTADO ÚNICO REAL
let datos = {
    aciertos: 0,
    puntosPorNivel: {},
    historial: []
};


// =======================================
// 🔥 CARGAR DATOS (SUPABASE + CACHE)
// =======================================

export async function cargarDatosUsuario() {

if (datosCargados) return;
datosCargados = true;

const email = window.auth?.currentUser?.email;

// RESET limpio SOLO memoria
datos = {
    aciertos: 0,
    puntosPorNivel: {},
    historial: []
};

// ===============================
// 1. SUPABASE (PRIORIDAD)
// ===============================
if (email && window.cargarProgresoSupabase) {

    const filas = await window.cargarProgresoSupabase(email);

    console.log("📦 FILAS SUPABASE:", filas);

    for (const fila of filas) {

        const nivel = fila.nivel || fila.juego;

        if (!nivel) continue;

        datos.puntosPorNivel[nivel] =
            Number(fila.puntos) || 0;
    }

    console.log("✅ DATOS CARGADOS SUPABASE:", datos);

}

// ===============================
// 2. CACHE (SOLO FALLBACK)
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
// NORMALIZAR TEXTO
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

if (score) {

const global = Object.values(datos.puntosPorNivel || {})
.reduce((a, b) => a + (Number(b) || 0), 0);

score.innerHTML =
`Puntos: ${obtenerPuntosNivel()} | Global: ${global}`;
}
}


// =======================================
// GUARDAR TODO (SUPABASE + CACHE)
// =======================================

async function guardarTodo() {

// cache local (NO fuente de verdad)
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
// SUMAR PUNTO GLOBAL
// =======================================

function calc(op, max) {

let a = Math.floor(Math.random() * max);
let b = Math.floor(Math.random() * max);

if (op === "+") return { p: `${a} + ${b}`, r: (a + b).toString() };
if (op === "-") return { p: `${a} - ${b}`, r: (a - b).toString() };
return { p: `${a} × ${b}`, r: (a * b).toString() };
}


// =======================================
// BASES Y JUEGOS (NO TOCADO)
// =======================================

// (TU CÓDIGO DE BASES Y JUEGOS SE QUEDA IGUAL)
// SOLO OMITIDO AQUÍ PARA NO ROMPER LONGITUD



// =======================================
// INICIAR JUEGO
// =======================================

export async function iniciarJuego(key) {

claveActual = key;

await cargarDatosUsuario();

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

// lógica igual que la tuya
// (NO SE MODIFICA)

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
