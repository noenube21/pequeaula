import { comprobarRecompensas } from "./recompensas.js";
import { guardarProgreso as guardarFirestore, cargarProgreso } from "./progreso.js";

// =======================================

let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let usadas = {};

// 🔥 PROGRESO GLOBAL
let datos = {
    aciertos: 0,
    puntosPorNivel: {},
    historial: []
};

// =======================================
// 🔥 CARGAR PROGRESO
export async function cargarDatosUsuario(){

    const remoto = await cargarProgreso();

    if(remoto){
        datos = remoto;
    } else {
        datos = JSON.parse(localStorage.getItem("progreso")) || {
            aciertos: 0,
            puntosPorNivel: {},
            historial: []
        };
    }

    actualizarPuntos();
    window.datos = datos; // 👈 clave para familia
}

// =======================================
function limpiar(t){
    return (t || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
function levenshtein(a, b){
    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++){
        for (let j = 1; j <= a.length; j++){

            if (b.charAt(i-1) === a.charAt(j-1)){
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j-1] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// =======================================
// 🔥 PUNTOS POR NIVEL + HISTORIAL
function sumarPunto(){

    const nivel = claveActual;

    if(!datos.puntosPorNivel[nivel]){
        datos.puntosPorNivel[nivel] = 0;
    }

    datos.puntosPorNivel[nivel] += 1;

    // 🔥 HISTORIAL GLOBAL
    datos.historial.push({
        nivel: nivel,
        fecha: Date.now()
    });
}

// =======================================
function obtenerGlobal(){
    return Object.values(datos.puntosPorNivel || {})
        .reduce((a,b)=>a + (Number(b)||0), 0);
}

// =======================================
function actualizarPuntos(){
    const score = document.getElementById("score");

    if(score){
        score.innerHTML = `
            <div>Puntos nivel: ${datos.puntosPorNivel[claveActual] || 0}</div>
            <div>Total global: ${obtenerGlobal()}</div>
        `;
    }
}

// =======================================
async function guardarTodo(){

    localStorage.setItem("progreso", JSON.stringify(datos));

    try {
        await guardarFirestore(datos);
    } catch {}
}

// =======================================
// 📚 BASES (las tuyas se mantienen)
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"]
];

const castellanoBase = [
["El ___ es verde","arbol"],
["El ___ ladra","perro"],
["El ___ vuela","pajaro"],
["El ___ es rojo","fuego"]
];

const cienciasBase = [
["¿Cuál es el planeta más cercano al Sol?","mercurio"],
["¿Cuál es el gas que respiramos?","oxigeno"],
["¿Cuál es el satélite de la Tierra?","luna"],
["¿Qué órgano bombea la sangre?","corazon"]
];

// =======================================
function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    const rand = otras.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta,...rand].sort(()=>0.5-Math.random());
}

// =======================================
// 🎮 JUEGOS

const Juegos = {

    matematicas1:{ generar:()=>({p:"2 + 2",r:"4"}) },

    ingles1:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1], inglesBase.map(y=>y[1]))
        }))
    },

    castellano1:{
        preguntas: castellanoBase.map(x=>({
            p:`Completa: ${x[0]}`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1], castellanoBase.map(y=>y[1]))
        }))
    },

    ciencias1:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1], cienciasBase.map(y=>y[1]))
        }))
    }
};

// =======================================
// 🚀 INICIAR JUEGO

export async function iniciarJuego(key){

    claveActual = key;
    juegoActual = Juegos[key];

    await cargarDatosUsuario();

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const input = document.getElementById("respuesta");
    const resultado = document.getElementById("resultado");

    pregunta.innerHTML = "";
    zona.innerHTML = "";
    resultado.innerHTML = "";
    input.value = "";

    actualizarPuntos();

    if(!juegoActual){
        pregunta.innerText = "Nivel no encontrado";
        return;
    }

    if(juegoActual.generar){

        const gen = juegoActual.generar();

        preguntaActual = {
            p: gen.p,
            r: gen.r,
            tipo: "input"
        };

    } else {

        const lista = juegoActual.preguntas;

        if(!usadas[key]) usadas[key] = new Set();

        let disponibles = lista.filter(p => !usadas[key].has(p.p));

        if(disponibles.length === 0){
            usadas[key].clear();
            disponibles = [...lista];
        }

        preguntaActual = disponibles[Math.floor(Math.random()*disponibles.length)];

        usadas[key].add(preguntaActual.p);
    }

    pregunta.innerText = preguntaActual.p;

    input.style.display = (preguntaActual.tipo === "input") ? "block" : "none";
    zona.innerHTML = "";

    if(preguntaActual.tipo === "test"){
        preguntaActual.opciones.forEach(op=>{
            const b = document.createElement("button");
            b.innerText = op;
            b.classList.add("opcion");

            b.onclick = ()=>{
                document.querySelectorAll("#zona .opcion")
                    .forEach(x=>x.classList.remove("seleccionada"));

                b.classList.add("seleccionada");
                input.value = op;
            };

            zona.appendChild(b);
        });
    }
}

// =======================================
// ✅ COMPROBAR

export async function comprobar(){

    const r = limpiar(document.getElementById("respuesta").value);
    const ok = limpiar(preguntaActual.r);

    const resultado = document.getElementById("resultado");

    const correcto = levenshtein(r, ok) <= 1;

    if(correcto){
        sumarPunto();
        datos.aciertos++;
        resultado.innerText = "✔ Correcto";
    } else {
        resultado.innerText = "✘ Incorrecto";
    }

    actualizarPuntos();
    await guardarTodo();

    comprobarRecompensas(datos.aciertos);

    setTimeout(()=>{
        iniciarJuego(claveActual);
    },500);
}
