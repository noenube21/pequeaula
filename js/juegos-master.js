// ✅ FIREBASE
import { getDoc, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db, auth } from "../firebase-config.js";

// =======================================
let preguntaActual = null;
let preguntas = [];
let juego = null;
let clave = "";

let puntos = 0;
let bloqueado = false;

// =======================================
// ✅ FIREBASE
export async function cargarFirebase(){

    const user = auth.currentUser;
    if(!user) return;

    const ref = doc(db,"usuarios",user.uid);
    const snap = await getDoc(ref);

    if(snap.exists()){
        puntos = snap.data().puntos || 0;
    }else{
        await setDoc(ref,{puntos:0});
        puntos = 0;
    }

    pintarPuntos();
}

// =======================================
async function guardarFirebase(){

    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),
    {puntos},{merge:true});
}

// =======================================
function pintarPuntos(){
    const el = document.getElementById("score");
    if(el) el.innerText = "Puntos: " + puntos;
}

// =======================================
function limpiar(t){
    return t.toLowerCase().trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"");
}

// =======================================
function rnd(n){
    return Math.floor(Math.random()*n);
}

// =======================================
// ✅ DATOS
const baseIngles = [
["dog","perro"],["cat","gato"],["car","coche"],
["sun","sol"],["moon","luna"],["milk","leche"],
["book","libro"],["water","agua"],
["house","casa"],["food","comida"]
];

function opciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    return [correcta,...otras.sort(()=>Math.random()-0.5).slice(0,2)]
        .sort(()=>Math.random()-0.5);
}

// =======================================
const Juegos = {

    // ✅ MATEMÁTICAS
    matematicas1:{ generar:()=>gen("+",10) },
    matematicas2:{ generar:()=>gen("-",20) },
    matematicas3:{ generar:()=>gen("*",10) },

    // ✅ INGLÉS
    ingles1:{
        preguntas: baseIngles.map(x=>({
            p: x[0] + " =",
            r: x[1],
            tipo:"test",
            opciones: opciones(x[1], baseIngles.map(y=>y[1]))
        }))
    },

    ingles2:{
        preguntas: baseIngles.map(x=>({
            p: x[0] + " =",
            r: x[1],
            tipo:"input"
        }))
    },

    ingles3:{
        preguntas: baseIngles.map(x=>({
            p: x[1] + " =",
            r: x[0],
            tipo:"test",
            opciones: opciones(x[0], baseIngles.map(y=>y[0]))
        }))
    },

    // ✅ CASTELLANO
    castellano1:{
        preguntas:[
            "casa","mesa","lago","plato","silla","taza","perro","gato"
        ].map(p=>({
            p: p[0]+"__"+p.slice(2),
            r: p,
            tipo:"test",
            opciones:["casa","mesa","pato","taza","lago"]
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A",r:"mesa",tipo:"letras",opciones:["e","o","i"]},
            {p:"C _ M A",r:"cama",tipo:"letras",opciones:["a","o","e"]},
            {p:"P _ T O",r:"pato",tipo:"letras",opciones:["a","e","i"]},
            {p:"L _ G O",r:"lago",tipo:"letras",opciones:["a","o","u"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa",tipo:"test",opciones:["mesa","leer","correr"]}
        ]
    },

    // ✅ CIENCIAS
    ciencias1:{
        preguntas:[
            {p:"Gas respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","humo"]},
            {p:"Planeta rojo",r:"marte",tipo:"test",opciones:["marte","tierra","venus"]},
            {p:"Animal agua",r:"pez",tipo:"test",opciones:["pez","perro","gato"]}
        ]
    }
};

// =======================================
function gen(op,max){
    let a=rnd(max), b=rnd(max);

    if(op==="+") return {p:`${a}+${b}`,r:(a+b).toString()};
    if(op==="-") return {p:`${a}-${b}`,r:(a-b).toString()};
    return {p:`${a}×${b}`,r:(a*b).toString()};
}

// =======================================
// ✅ INICIAR
export function iniciarJuego(key){

    clave = key;
    juego = Juegos[key];

    if(!juego) return;

    preguntas = juego.generar ? [] : [...juego.preguntas];

    siguiente();
}

// =======================================
function siguiente(){

    const p = document.getElementById("pregunta");
    const z = document.getElementById("zona");
    const input = document.getElementById("respuesta");
    const btn = document.getElementById("btnComprobar");

    bloqueado = false;

    z.innerHTML="";
    input.value="";

    // ✅ MATES
    if(juego.generar){
        preguntaActual = juego.generar();
        p.innerText = preguntaActual.p;
        input.style.display="block";
        btn.style.display="block";
        return;
    }

    // ✅ FIN
    if(!preguntas.length){
        p.innerText="🎉 Nivel terminado";
        input.style.display="none";
        btn.style.display="none";
        return;
    }

    preguntaActual = preguntas.splice(rnd(preguntas.length),1)[0];
    p.innerText = preguntaActual.p;

    // ✅ INPUT
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
        btn.style.display="block";
        return;
    }

    input.style.display="none";
    btn.style.display="none";

    // ✅ LETRAS
    if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;

            b.onclick=()=>{
                input.value = preguntaActual.p.replace("_",op).replace(/ /g,"");
                comprobar();
            };

            z.appendChild(b);
        });
        return;
    }

    // ✅ TEST
    preguntaActual.opciones.forEach(op=>{
        const b=document.createElement("button");
        b.innerText=op;

        b.onclick=()=>{
            input.value = op;
            comprobar();
        };

        z.appendChild(b);
    });
}

// =======================================
export async function comprobar(){

    if(bloqueado) return;
    bloqueado = true;

    const r = limpiar(document.getElementById("respuesta").value);
    const ok = limpiar(preguntaActual.r);
    const res = document.getElementById("resultado");

    if(r === ok){
        puntos += 1;
        res.innerText="✅ Correcto";
    }else{
        res.innerText="❌ " + preguntaActual.r;
    }

    pintarPuntos();
    await guardarFirebase();

    setTimeout(()=>siguiente(),700);
}
``
