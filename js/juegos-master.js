import { comprobarRecompensas } from "./recompensas.js";
import { db } from "./firebase-config.js";
import { auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ===== PROGRESO =====
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0, puntos: 0 };

let preguntasRestantes = [];
let puntos = datos.puntos;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";

// ===== LIMPIAR =====
function limpiar(t){
    return t.toLowerCase().trim();
}

// ===== LEVENSHTEIN =====
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

// ===== FIREBASE =====
async function guardarEnFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),{
        puntos,
        aciertos: datos.aciertos
    },{merge:true});
}

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

// ===== PUNTOS =====
function actualizarPuntos(){
    const s=document.getElementById("score");
    if(s) s.innerText="Puntos: "+puntos;
}

// ===== JUEGOS (IMPORTANTE) =====
const Juegos={

    castellano1:{
        preguntas:[
            {p:"c__a",r:"casa",opciones:["casa","cama","copa"]},
            {p:"m__a",r:"mesa",opciones:["mesa","masa","misa"]}
        ]
    },

    ciencias1:{
        preguntas:[
            {p:"¿Gas que respiramos?",r:"oxigeno",opciones:["oxígeno","agua","fuego"]}
        ]
    }
};

// ===== INICIAR =====
export function iniciarJuego(key){

    try{

    claveActual = key;
    juegoActual = Juegos[key];

    if(!juegoActual){
        document.getElementById("pregunta").innerText="ERROR NIVEL";
        return;
    }

    preguntasRestantes=[...juegoActual.preguntas];
    siguientePregunta();

    }catch(e){
        console.log("Error iniciar",e);
    }
}

// ===== SIGUIENTE =====
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

// ===== COMPROBAR =====
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
    localStorage.setItem("progreso",JSON.stringify(datos));

    comprobarRecompensas(datos.aciertos);
    guardarEnFirebase();

    setTimeout(()=>siguientePregunta(),1000);
}
