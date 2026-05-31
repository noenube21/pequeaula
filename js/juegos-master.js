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

let bloqueado = false; // 🔥 evita spam
let totalPreguntas = 0;
let hechas = 0;

// =======================================
export async function cargarFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    const snap = await getDoc(doc(db,"usuarios",user.uid));
    if(snap.exists()){
        const data = snap.data();
        puntos = data.puntos || 0;
    }

    actualizarPuntos();
}

// =======================================
async function guardarEnFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),
    { puntos }, {merge:true});
}

// =======================================
function limpiar(t){
    return t.toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"").trim();
}

// =======================================
function levenshtein(a,b){

    const m=[];

    for(let i=0;i<=b.length;i++) m[i]=[i];
    for(let j=0;j<=a.length;j++) m[0][j]=j;

    for(let i=1;i<=b.length;i++){
        for(let j=1;j<=a.length;j++){
            m[i][j]= b[i-1]===a[j-1]
                ? m[i-1][j-1]
                : Math.min(
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
function calc(op,max){
    let a=Math.floor(Math.random()*max);
    let b=Math.floor(Math.random()*max);

    if(op==="+") return {p:`${a} + ${b}`, r:(a+b).toString()};
    if(op==="-") return {p:`${a} - ${b}`, r:(a-b).toString()};
    return {p:`${a} × ${b}`, r:(a*b).toString()};
}

// =======================================
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"]
];

function opciones(c, lista){
    const otras = lista.filter(x=>x!==c);
    return [c,...otras.sort(()=>Math.random()-0.5).slice(0,2)]
        .sort(()=>Math.random()-0.5);
}

// =======================================
const Juegos = {

    matematicas1:{ generar:()=>calc("+",10) },
    matematicas2:{ generar:()=>calc("-",20) },
    matematicas3:{ generar:()=>calc("*",10) },

    ingles1:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1],inglesBase.map(y=>y[1]))
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
            opciones: opciones(x[0],inglesBase.map(y=>y[0]))
        }))
    },

    castellano1:{
        preguntas:[
            "casa","mesa","mango","plato","huevo","lago"
        ].map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones:["casa","mesa","mango","pato","mano"]
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]},
            {p:"P _ T O", r:"pato", tipo:"letras", opciones:["a","e","i"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa",tipo:"test",opciones:["mesa","leer","correr"]}
        ]
    },

    ciencias1:{
        preguntas:[
            {p:"Gas que respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"Planeta rojo",r:"marte",tipo:"test",opciones:["marte","tierra","venus"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"Forma Tierra",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]},
            {p:"Donde viven peces",r:"agua",tipo:"test",opciones:["agua","aire","tierra"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"Órgano que late",r:"corazon",tipo:"test",opciones:["corazón","ojo","mano"]},
            {p:"Para ver usamos",r:"ojo",tipo:"test",opciones:["ojo","mano","pierna"]}
        ]
    }
};

// =======================================
export function iniciarJuego(key){

    claveActual = key;
    juegoActual = Juegos[key];

    if(!juegoActual) return;

    if(!juegoActual.generar){
        preguntasRestantes = [...juegoActual.preguntas];
        totalPreguntas = preguntasRestantes.length;
        hechas = 0;
    }

    siguientePregunta();
}

// =======================================
function siguientePregunta(){

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const input = document.getElementById("respuesta");

    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        pregunta.innerText = preguntaActual.p;
        input.value="";
        return;
    }

    if(preguntasRestantes.length === 0){
        pregunta.innerText = "🎉 Nivel completado";
        zona.innerHTML = "";
        return;
    }

    hechas++;
    document.getElementById("tituloJuego").innerText =
        claveActual.toUpperCase()+" ("+hechas+"/"+totalPreguntas+")";

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText = preguntaActual.p;

    zona.innerHTML="";
    input.value="";
    input.style.display="none";

    if(preguntaActual.tipo==="input"){
        input.style.display="block";
        return;
    }

    preguntaActual.opciones.forEach(op=>{
        const b=document.createElement("button");
        b.innerText=op;

        b.onclick=()=>{
            if(bloqueado) return;

            if(preguntaActual.tipo==="letras"){
                input.value = preguntaActual.p
                    .replace("_",op)
                    .replace(/ /g,"");
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

    const r = limpiar(document.getElementById("respuesta").value);
    const correcta = limpiar(preguntaActual.r);

    const resultado = document.getElementById("resultado");

    if(levenshtein(r,correcta)<=1){
        puntos += 10;
        resultado.innerText="✅ Correcto";
    }else{
        resultado.innerText="❌ "+preguntaActual.r;
    }

    actualizarPuntos();
    await guardarEnFirebase();

    setTimeout(()=>{
        bloqueado = false;
        siguientePregunta();
    },800);
}
``
