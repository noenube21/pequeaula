import { comprobarRecompensas } from "./recompensas.js";
import { guardarProgreso as guardarFirestore, cargarProgreso } from "./progreso.js";

// =======================================

let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let usadas = {};

let datos = {
    aciertos: 0,
    puntosPorNivel: {}
};

// =======================================
// 🔥 CARGA SEGURA (LOCAL + FIREBASE)
export async function cargarDatosUsuario(){

    const local = JSON.parse(localStorage.getItem("progreso")) || {};
    let remoto = null;

    try {
        remoto = await cargarProgreso();
    } catch {}

    datos = {
        aciertos: 0,
        puntosPorNivel: {},
        ...local,
        ...(remoto || {})
    };

    if(!datos.puntosPorNivel){
        datos.puntosPorNivel = {};
    }

    actualizarPuntos();
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
// 🔥 PUNTOS POR NIVEL
function obtenerPuntosNivel(){
    if(!datos.puntosPorNivel[claveActual]){
        datos.puntosPorNivel[claveActual] = 0;
    }
    return datos.puntosPorNivel[claveActual];
}

function sumarPunto(){
    datos.puntosPorNivel[claveActual] =
        obtenerPuntosNivel() + 1;
}

// =======================================
function actualizarPuntos(){
    const score = document.getElementById("score");
    if(score){
        score.innerText =
            `Puntos: ${obtenerPuntosNivel()} | ${claveActual}`;
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
// 📚 BASES

const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["house","casa"],["tree","arbol"],["food","comida"],["school","escuela"],
["friend","amigo"],["happy","feliz"],["sad","triste"],
["run","correr"],["eat","comer"],["drink","beber"],["sleep","dormir"],["play","jugar"]
];

// 🔥 CASTELLANO (NUEVO FORMATO FRASES SIN ACENTOS)
const castellanoBase = [
["El ___ es verde","arbol"],
["El ___ escribe en el cuaderno","nino"],
["El ___ es un medio de transporte","avion"],
["El ___ ladra","perro"],
["La ___ es redonda","tierra"],
["El ___ tiene ruedas","coche"],
["El ___ brilla de noche","sol"],
["La ___ es dulce","manzana"],
["El ___ nada en el agua","pez"],
["El ___ vuela en el cielo","pajaro"],
["El ___ sirve para escribir","lapiz"],
["El ___ es rojo y caliente","fuego"],
["El ___ vive en el mar","pez"],
["El ___ es frio","hielo"],
["El ___ es un animal domestico","gato"],
["El ___ da leche","vaca"],
["El ___ crece en el campo","arbol"],
["El ___ es el rey de la selva","leon"],
["El ___ ilumina la casa","foco"],
["El ___ es un instrumento musical","guitarra"]
];

// 🔥 CIENCIAS (+15)
const cienciasBase = [
["planeta cercano al sol","mercurio"],
["gas que respiramos","oxigeno"],
["satelite de la tierra","luna"],
["agua solida","hielo"],
["estrella principal","sol"],
["planeta rojo","marte"],
["planeta grande","jupiter"],
["planeta con anillos","saturno"],
["organo que bombea sangre","corazon"],
["organo del pensamiento","cerebro"],
["gas de las plantas","co2"],
["proceso de plantas","fotosintesis"],
["unidad de vida","celula"],
["fuerza que nos atrae","gravedad"],
["animal que da leche","vaca"],
["planeta donde vivimos","tierra"],
["respiracion","pulmones"],
["digestivo","estomago"],
["hueso largo","femur"],
["capa protectora","ozono"]
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
    matematicas2:{ generar:()=>({p:"5 - 3",r:"2"}) },
    matematicas3:{ generar:()=>({p:"3 x 3",r:"9"}) },

    ingles1:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1], inglesBase.map(y=>y[1]))
        }))
    },

    ingles2:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo:"input"
        }))
    },

    ingles3:{
        preguntas: inglesBase.map(x=>({
            p:`Traduce: ${x[1]}`,
            r:x[0],
            tipo:"input"
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

    castellano2:{
        preguntas: castellanoBase.map(x=>({
            p:`¿Qué palabra completa? "${x[0]}"`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1], castellanoBase.map(y=>y[1]))
        }))
    },

    castellano3:{
        preguntas: castellanoBase
            .sort(()=>Math.random()-0.5)
            .slice(0,15)
            .map(x=>({
                p:`Completa: ${x[0]}`,
                r:x[1],
                tipo:"test",
                opciones: generarOpciones(x[1], castellanoBase.map(y=>y[1]))
            }))
    },

    ciencias1:{
        preguntas: cienciasBase.slice(0,10).map(x=>({
            p:`${x[0]}?`,
            r:x[1],
            tipo:"input"
        }))
    },

    ciencias2:{
        preguntas: cienciasBase.slice(10,15).map(x=>({
            p:`${x[0]}?`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1], cienciasBase.map(y=>y[1]))
        }))
    },

    ciencias3:{
        preguntas: cienciasBase.slice(5,20).map(x=>({
            p:`${x[0]}?`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1], cienciasBase.map(y=>y[1]))
        }))
    }
};

// =======================================
// 🚀 INICIO

export async function iniciarJuego(key){

    await cargarDatosUsuario();

    claveActual = key;
    juegoActual = Juegos[key];

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
            r: String(gen.r),
            tipo: "input"
        };

    } else {

        if(!usadas[key]) usadas[key] = new Set();

        const lista = juegoActual.preguntas || [];

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
                    .forEach(btn => btn.classList.remove("seleccionada"));

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
