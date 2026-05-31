import { comprobarRecompensas } from "./recompensas.js";

// ✅ FIREBASE
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

// =======================================
export async function cargarFirebase(){

    const user = auth.currentUser;
    if(!user) return;

    const snap = await getDoc(doc(db,"usuarios",user.uid));

    if(snap.exists()){
        const data = snap.data();
        puntos = data.puntos || 0;
    }else{
        await setDoc(doc(db,"usuarios",user.uid), { puntos:0 });
        puntos = 0;
    }

    actualizarPuntos();
}

// =======================================
async function guardarEnFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),
    { puntos }, { merge:true });
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
    return [correcta,...otras.sort(()=>Math.random()-0.5).slice(0,2)]
        .sort(()=>Math.random()-0.5);
}

// =======================================
const Juegos = {

    // ✅ MATEMÁTICAS
    matematicas1:{ generar:()=>calc("+",20) },
    matematicas2:{ generar:()=>calc("-",30) },
    matematicas3:{ generar:()=>calc("*",12) },

    // ✅ INGLÉS
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

    // ✅ CASTELLANO
    castellano1:{
        preguntas:[
            "casa","mesa","mango","plato","huevo",
            "lago","perro","gato","silla","taza"
        ].map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones:["casa","mesa","pato","taza","mano"]
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]},
            {p:"P _ T O", r:"pato", tipo:"letras", opciones:["a","e","i"]},
            {p:"L _ G O", r:"lago", tipo:"letras", opciones:["a","o","u"]}
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

    // ✅ CIENCIAS
    ciencias1:{
        preguntas:[
            {p:"Gas que respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","humo"]},
            {p:"Planeta rojo",r:"marte",tipo:"test",opciones:["marte","tierra","venus"]},
            {p:"Animal acuático",r:"pez",tipo:"test",opciones:["pez","perro","gato"]},
            {p:"Astro del día",r:"sol",tipo:"test",opciones:["sol","luna","estrella"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"Forma de la Tierra",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]},
            {p:"Dónde viven peces",r:"agua",tipo:"test",opciones:["agua","aire","tierra"]},
            {p:"El sol es",r:"estrella",tipo:"test",opciones:["estrella","planeta","luna"]},
            {p:"Respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","humo"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"Órgano que late",r:"corazon",tipo:"test",opciones:["corazón","ojo","mano"]},
            {p:"Para ver usamos",r:"ojo",tipo:"test",opciones:["ojo","pierna","brazo"]},
            {p:"Planeta donde vivimos",r:"tierra",tipo:"test",opciones:["tierra","marte","saturno"]},
            {p:"Sistema solar tiene",r:"planetas",tipo:"test",opciones:["planetas","casas","perros"]}
        ]
    }
};

// =======================================
export function iniciarJuego(key){

    claveActual = key;
    juegoActual = Juegos[key];

    if(!juegoActual) return;

    preguntasRestantes = juegoActual.generar
        ? []
        : [...juegoActual.preguntas];

    siguientePregunta();
}

// =======================================
function siguientePregunta(){

    const p = document.getElementById("pregunta");
    const z = document.getElementById("zona");
    const input = document.getElementById("respuesta");

    bloqueado = false;

    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        p.innerText = preguntaActual.p;
        input.value="";
        return;
    }

    if(preguntasRestantes.length === 0){
        p.innerText="🎉 Nivel completado";
        z.innerHTML="";
        return;
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    p.innerText = preguntaActual.p;

    z.innerHTML="";
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
            input.value=op;
            comprobar();
        };

        z.appendChild(b);
    });

    if(preguntaActual.tipo==="letras"){
        z.innerHTML="";
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;

            b.onclick=()=>{
                input.value = preguntaActual.p.replace("_",op).replace(/ /g,"");
                comprobar();
            };

            z.appendChild(b);
        });
    }
}

// =======================================
export async function comprobar(){

    if(bloqueado) return;
    bloqueado = true;

    const r = limpiar(document.getElementById("respuesta").value);
    const ok = limpiar(preguntaActual.r);

    const resultado=document.getElementById("resultado");

    if(r === ok){
        puntos += 1;
        resultado.innerText="✅ Correcto";
    }else{
        resultado.innerText="❌ " + preguntaActual.r;
    }

    actualizarPuntos();
    await guardarEnFirebase();

    setTimeout(()=>{
        siguientePregunta();
    },700);
}
