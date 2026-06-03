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
    puntos: 0
};

// =======================================
// 🔥 CARGA ROBUSTA (ARREGLADA DEFINITIVA)
export async function cargarDatosUsuario(){

    const local = JSON.parse(localStorage.getItem("progreso")) || {};
    let remoto = null;

    try {
        remoto = await cargarProgreso();
    } catch (e) {
        console.warn("Firebase no disponible:", e);
    }

    datos = {
        aciertos: Number(local.aciertos || 0),
        puntos: Number(local.puntos || 0),
        ...(remoto && Object.keys(remoto).length ? remoto : {})
    };

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
function actualizarPuntos(){
    const score = document.getElementById("score");
    if(score){
        score.innerText = "Puntos: " + datos.puntos;
    }
}

// =======================================
async function guardarTodo(){

    localStorage.setItem("progreso", JSON.stringify(datos));

    try {
        await guardarFirestore(datos);
        console.log("🔥 Guardado Firebase OK:", datos);
    } catch (e) {
        console.warn("❌ Firebase error (solo local guardado):", e);
    }
}

// =======================================
function calc(op,max){

    let a=Math.floor(Math.random()*max);
    let b=Math.floor(Math.random()*max);

    if(op==="+") return {p:`${a} + ${b}`,r:(a+b).toString()};
    if(op==="-") return {p:`${a} - ${b}`,r:(a-b).toString()};
    return {p:`${a} × ${b}`,r:(a*b).toString()};
}

// =======================================
// 📚 BASES

const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["house","casa"],["tree","árbol"],["food","comida"],["school","escuela"],
["friend","amigo"],["happy","feliz"],["sad","triste"],["run","correr"],
["eat","comer"],["drink","beber"],["sleep","dormir"],["play","jugar"]
];

const castellanoBase = [
["árbol","arbol"],["camión","camion"],["corazón","corazon"],
["lápiz","lapiz"],["teléfono","telefono"],["canción","cancion"],
["niño","nino"],["mañana","manana"],["león","leon"],
["acción","accion"],["fácil","facil"],["difícil","dificil"]
];

const cienciasBase = [
["¿Planeta más cercano al Sol?","mercurio"],
["¿Gas que respiramos?","oxigeno"],
["¿Satélite de la Tierra?","luna"],
["¿Estado sólido del agua?","hielo"],
["¿Estrella principal?","sol"],
["¿Planeta rojo?","marte"],
["¿Planeta más grande?","jupiter"],
["¿Órgano que bombea sangre?","corazon"],
["¿Órgano del pensamiento?","cerebro"],
["¿Planeta donde vivimos?","tierra"],
["¿Sistema respiratorio?","pulmones"],
["¿Sistema digestivo?","estomago"],
["¿Hueso más largo?","femur"],
["¿Capa protectora Tierra?","ozono"]
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

    matematicas1:{ generar:()=>calc("+",10) },
    matematicas2:{ generar:()=>calc("-",20) },
    matematicas3:{ generar:()=>calc("*",10) },

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
            p:`Escribe correctamente: ${x[1]}`,
            r:x[0],
            tipo:"input"
        }))
    },

    castellano2:{
        preguntas:[
            { p:"¿Cuál es un sustantivo?", r:"mesa", tipo:"test", opciones:["mesa","correr","rojo"] },
            { p:"¿Cuál es un verbo?", r:"correr", tipo:"test", opciones:["correr","mesa","rápido"] }
        ]
    },

    castellano3:{
        preguntas:[
            { p:"¿Qué es un animal?", r:"perro", tipo:"test", opciones:["perro","mesa","azul"] },
            { p:"¿Qué es una acción?", r:"saltar", tipo:"test", opciones:["saltar","rojo","mesa"] },
            { p:"¿Qué es un objeto?", r:"mesa", tipo:"test", opciones:["mesa","correr","feliz"] },
            { p:"¿Qué es un verbo?", r:"comer", tipo:"test", opciones:["comer","coche","azul"] }
        ]
    },

    ciencias1:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"input"
        }))
    },

    ciencias2:{
        preguntas:[
            { p:"¿Planeta rojo?", r:"marte", tipo:"test", opciones:["marte","venus","jupiter"] },
            { p:"¿Órgano sangre?", r:"corazon", tipo:"test", opciones:["corazon","pulmon","higado"] }
        ]
    },

    // 🔥 CIENCIAS 3 ARREGLADO (TEST + BOTONES)
    ciencias3:{
        preguntas:[
            { p:"¿Cuál es la fórmula del agua?", r:"h2o", tipo:"test", opciones:["h2o","co2","o2"] },
            { p:"¿Qué fuerza nos atrae a la Tierra?", r:"gravedad", tipo:"test", opciones:["gravedad","magnetismo","energia"] },
            { p:"¿Cuál es el planeta azul?", r:"tierra", tipo:"test", opciones:["tierra","marte","venus"] },
            { p:"¿Qué órgano bombea sangre?", r:"corazon", tipo:"test", opciones:["corazon","pulmon","cerebro"] }
        ]
    }
};

// =======================================
// 🚀 INICIAR JUEGO
export function iniciarJuego(key){

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
        datos.puntos = Number(datos.puntos || 0) + 1;
        datos.aciertos = Number(datos.aciertos || 0) + 1;
        resultado.innerText = "✔ Correcto";
    } else {
        resultado.innerText = `✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    actualizarPuntos();
    await guardarTodo();
    comprobarRecompensas(datos.aciertos);

    setTimeout(()=>{
        iniciarJuego(claveActual);
    },500);
}
