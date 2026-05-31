import { comprobarRecompensas } from "./recompensas.js";

import { getDoc, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db, auth } from "../firebase-config.js";

// =======================================
let preguntasRestantes = [];
let puntos = 0;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let bloqueado = false;

// ✅ PROGRESO GLOBAL (solo base visual)
let datos = {
    aciertos: 0,
    puntos: 0
};

// =======================================
export async function cargarFirebase(){

    const user = auth.currentUser;
    if(!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if(snap.exists()){
        const data = snap.data();
        puntos = data.puntos || 0;
        datos.aciertos = data.aciertos || 0;
    }else{
        await setDoc(ref,{ puntos:0, aciertos:0 });
    }

    actualizarPuntos();
}

// =======================================
async function guardarEnFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),{
        puntos: puntos,
        aciertos: datos.aciertos
    },{merge:true});
}

// =======================================
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
function actualizarPuntos(){
    const score = document.getElementById("score");
    if(score){
        score.innerText = "Puntos: " + puntos;
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
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["house","casa"],["food","comida"]
];

function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    return [correcta,...otras.sort(()=>0.5-Math.random()).slice(0,2)]
        .sort(()=>0.5-Math.random());
}

// =======================================
const Juegos = {

    // ✅ MUCHAS preguntas matemáticas
    matematicas1:{ generar:()=>calc("+",20) },
    matematicas2:{ generar:()=>calc("-",30) },
    matematicas3:{ generar:()=>calc("*",12) },

    ingles1:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1],inglesBase.map(y=>y[1]))
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
            p:`${x[1]} =`,
            r:x[0],
            tipo:"test",
            opciones: generarOpciones(x[0],inglesBase.map(y=>y[0]))
        }))
    },

    castellano1:{
        preguntas:[
            "casa","mesa","mango","plato","huevo","lago",
            "taza","perro","gato","silla"
        ].map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones:["casa","mesa","mango","pato","taza","mano"]
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]},
            {p:"P _ T O", r:"pato", tipo:"letras", opciones:["a","e","i"]},
            {p:"L _ G O", r:"lago", tipo:"letras", opciones:["a","o","u"]},
            {p:"T _ Z A", r:"taza", tipo:"letras", opciones:["a","e","o"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa",tipo:"test",opciones:["mesa","leer","correr"]},
            {p:"¿Verbo?",r:"saltar",tipo:"test",opciones:["saltar","silla","gato"]},
            {p:"¿Sustantivo?",r:"perro",tipo:"test",opciones:["perro","leer","correr"]}
        ]
    },

    ciencias1:{
        preguntas:[
            {p:"Gas respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","humo"]},
            {p:"Planeta rojo",r:"marte",tipo:"test",opciones:["marte","tierra","venus"]},
            {p:"Animal agua",r:"pez",tipo:"test",opciones:["pez","perro","gato"]},
            {p:"Astro día",r:"sol",tipo:"test",opciones:["sol","luna","estrella"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"Forma Tierra",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]},
            {p:"Donde peces",r:"agua",tipo:"test",opciones:["agua","aire","tierra"]},
            {p:"Sol es",r:"estrella",tipo:"test",opciones:["estrella","planeta","luna"]},
            {p:"Respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","humo"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"Órgano late",r:"corazon",tipo:"test",opciones:["corazón","mano","ojo"]},
            {p:"Para ver",r:"ojo",tipo:"test",opciones:["ojo","pierna","brazo"]},
            {p:"Planeta vivimos",r:"tierra",tipo:"test",opciones:["tierra","marte","saturno"]},
            {p:"Sistema solar",r:"planetas",tipo:"test",opciones:["planetas","casas","perros"]}
        ]
    }
};

// =======================================
export function iniciarJuego(key){

    claveActual = key;
    juegoActual = Juegos[key];

    preguntasRestantes = juegoActual.generar
        ? []
        : [...juegoActual.preguntas];

    siguientePregunta();
}

// =======================================
function siguientePregunta(){

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const input = document.getElementById("respuesta");

    bloqueado = false;

    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        pregunta.innerText = preguntaActual.p;
        input.value="";
        return;
    }

    if(!preguntasRestantes.length){
        pregunta.innerText = "🎉 Nivel completado";
        zona.innerHTML = "";
        return;
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText = preguntaActual.p;

    zona.innerHTML="";
    input.value="";

    if(preguntaActual.tipo==="input"){
        input.style.display="block";
        return;
    }

    input.style.display="none";

    preguntaActual.opciones.forEach(op=>{
        const b=document.createElement("button");
        b.innerText=op;

        b.onclick=()=>{
            if(bloqueado) return;

            if(preguntaActual.tipo==="letras"){
                input.value = preguntaActual.p.replace("_",op).replace(/ /g,"");
            }else{
                input.value = op;
            }

            comprobar();
        };

        zona.appendChild(b);
    });
}

// =======================================
export async function comprobar(){

    if(bloqueado) return;
    bloqueado = true;

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    if(r === ok){
        puntos += 1; // ✅ acumulativo real
        datos.aciertos++;
        resultado.innerText="✔ Correcto";
    }else{
        resultado.innerText=`✘ ${preguntaActual.r}`;
    }

    actualizarPuntos();
    guardarEnFirebase();

    setTimeout(()=>{
        siguientePregunta();
    },800);
}
