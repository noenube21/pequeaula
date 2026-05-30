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
        console.log("Firebase error");
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
["milk","leche"],["car","coche"],["water","agua"]
];

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
            opciones: generarOpciones(x[1],inglesBase.map(y=>y[1]))
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]}
        ]
    },

    ciencias1:{
        preguntas:[
            {p:"¿Gas que respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"¿Planeta rojo?",r:"marte",tipo:"test",opciones:["marte","tierra","jupiter"]}
        ]
    }
};

// =======================================
export function iniciarJuego(key){

    claveActual = key;
    juegoActual = Juegos[key];

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    pregunta.innerHTML="";
    zona.innerHTML="";
    input.value="";

    if(!juegoActual){
        pregunta.innerText="Nivel no encontrado";
        return;
    }

    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        pregunta.innerText = preguntaActual.p;
        return;
    }

    preguntasRestantes=[...juegoActual.preguntas];
    siguientePregunta();
}

// =======================================
function siguientePregunta(){

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    zona.innerHTML="";
    input.value="";

    if(preguntasRestantes.length===0){
        pregunta.innerText="FIN 🎉";
        return;
    }

    preguntaActual=preguntasRestantes.pop();
    pregunta.innerText=preguntaActual.p;

    input.style.display="none";

    if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                let palabra = preguntaActual.p
                    .replace("_", op)
                    .replace(/ /g,"")
                    .toLowerCase();

                input.value = palabra;
                seleccionar(b);
            };

            zona.appendChild(b);
        });
    }

    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=op;
                seleccionar(b);
            };

            zona.appendChild(b);
        });
    }
}

// =======================================
function seleccionar(btn){
    document.querySelectorAll(".opcion").forEach(o=>{
        o.classList.remove("seleccionada");
    });
    btn.classList.add("seleccionada");
}

// =======================================
export function comprobar(){

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    const correcto = levenshtein(r,ok)<=1;

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos++;
        datos.aciertos++;
    } else {
        resultado.innerText="✘ Incorrecto";
    }

    actualizarPuntos();

    guardarProgreso();
    comprobarRecompensas(datos.aciertos);
    guardarEnFirebase();

    setTimeout(()=>siguientePregunta(),1000);
}
``
