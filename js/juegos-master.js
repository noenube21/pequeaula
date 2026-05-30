// =======================================
import { comprobarRecompensas } from "./recompensas.js";
import { db } from "./firebase-config.js";
import { auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// =======================================
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0, puntos: 0 };

let preguntasRestantes = [];
let puntos = datos.puntos;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";

// =======================================
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
function levenshtein(a,b){
    const m=[];
    for(let i=0;i<=b.length;i++){ m[i]=[i]; }
    for(let j=0;j<=a.length;j++){ m[0][j]=j; }

    for(let i=1;i<=b.length;i++){
        for(let j=1;j<=a.length;j++){
            if(b[i-1]===a[j-1]) m[i][j]=m[i-1][j-1];
            else m[i][j]=Math.min(
                m[i-1][j-1]+1,
                m[i][j-1]+1,
                m[i-1][j]+1
            );
        }
    }
    return m[b.length][a.length];
}

// =======================================
function actualizarPuntos(){
    const s=document.getElementById("score");
    if(s) s.innerText="Puntos: "+puntos;
}

// =======================================
function guardarProgreso(){
    datos.puntos = puntos;
    localStorage.setItem("progreso", JSON.stringify(datos));
}

// =======================================
async function guardarEnFirebase(){
    try{
        const user = auth.currentUser;
        if(!user) return;

        await setDoc(doc(db,"usuarios",user.uid),{
            puntos:puntos,
            aciertos:datos.aciertos
        },{merge:true});

    }catch(e){
        console.log("Firebase guardar error");
    }
}

// =======================================
export async function cargarDesdeFirebase(){
    try{
        const user = auth.currentUser;
        if(!user) return;

        const ref = doc(db,"usuarios",user.uid);
        const snap = await getDoc(ref);

        if(snap.exists()){
            const d = snap.data();

            puntos = d.puntos || 0;
            datos.aciertos = d.aciertos || 0;

            actualizarPuntos();
        }

    }catch(e){
        console.log("Firebase ignorado");
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
function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    const rand = otras.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta,...rand].sort(()=>0.5-Math.random());
}

// =======================================
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["car","coche"],["water","agua"]
];

// =======================================
const Juegos = {

    matematicas1:{ generar:()=>calc("+",10) },
    matematicas2:{ generar:()=>calc("-",20) },
    matematicas3:{ generar:()=>calc("*",10) },

    castellano1:{
        preguntas:[
            "casa","mesa","mango","plato"
        ].map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            opciones:["casa","mesa","mango","pato"]
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", opciones:["a","o","e"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr", opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa", opciones:["mesa","leer","correr"]}
        ]
    },

    ciencias1:{
        preguntas:[
            {p:"¿Gas que respiramos?",r:"oxigeno", opciones:["oxígeno","agua","fuego"]},
            {p:"¿Planeta rojo?",r:"marte", opciones:["marte","tierra","jupiter"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"¿Forma de la Tierra?",r:"redonda", opciones:["redonda","plana","cuadrada"]},
            {p:"¿Dónde viven los peces?",r:"agua", opciones:["agua","aire","tierra"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"¿Órgano que late?",r:"corazon", opciones:["corazón","ojo","mano"]},
            {p:"¿Planeta donde vivimos?",r:"tierra", opciones:["tierra","marte","saturno"]}
        ]
    },

    ingles1:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            opciones: generarOpciones(x[1],inglesBase.map(y=>y[1]))
        }))
    }
};

// =======================================
export function iniciarJuego(key){

    claveActual = key;

    juegoActual = Juegos[key];

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    zona.innerHTML="";
    input.value="";

    if(!juegoActual){
        pregunta.innerText="ERROR NIVEL";
        return;
    }

    if(juegoActual.generar){
        preguntaActual=juegoActual.generar();
        input.style.display="block";
        pregunta.innerText=preguntaActual.p;
        return;
    }

    preguntasRestantes=[...juegoActual.preguntas];
    siguientePregunta();
}

// =======================================
function siguientePregunta(){

    const p=document.getElementById("pregunta");
    const z=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    z.innerHTML="";
    input.value="";

    if(preguntasRestantes.length===0){
        p.innerText="FIN";
        return;
    }

    preguntaActual=preguntasRestantes.pop();
    p.innerText=preguntaActual.p;

    preguntaActual.opciones.forEach(op=>{
        const b=document.createElement("button");
        b.innerText=op;
        b.className="btn opcion";

        b.onclick=()=>{
            input.value=op;
            document.querySelectorAll(".opcion").forEach(o=>o.classList.remove("seleccionada"));
            b.classList.add("seleccionada");
        };

        z.appendChild(b);
    });
}

// =======================================
export function comprobar(){

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const res=document.getElementById("resultado");

    const correcto = levenshtein(r,ok)<=1;

    if(correcto){
        puntos++;
        datos.aciertos++;
        res.innerText="✔ Correcto";
    } else {
        res.innerText="✘ Incorrecto";
    }

    actualizarPuntos();

    guardarProgreso();
    comprobarRecompensas(datos.aciertos);
    guardarEnFirebase();

    setTimeout(()=>siguientePregunta(),1000);
}
