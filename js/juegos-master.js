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
function levenshtein(a, b){

    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++){
        for (let j = 1; j <= a.length; j++){
            if (b.charAt(i-1) === a.charAt(j-1)) {
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
        score.innerText = "Puntos: " + puntos;
    }
}

// =======================================
function guardarProgreso(){
    datos.puntos = puntos;
    localStorage.setItem("progreso", JSON.stringify(datos));
}

// =======================================
// ✅ GUARDAR FIREBASE
async function guardarEnFirebase(){

    const user = auth.currentUser;
    if(!user) return;

    try{
        await setDoc(doc(db, "usuarios", user.uid), {
            puntos: puntos,
            aciertos: datos.aciertos
        }, { merge: true });

    }catch(e){
        console.error(e);
    }
}

// =======================================
// ✅ CARGAR FIREBASE (NO BLOQUEA)
export async function cargarDesdeFirebase(){

    try{

        const user = auth.currentUser;
        if(!user) return;

        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);

        if(snap.exists()){
            const data = snap.data();

            datos.aciertos = data.aciertos || 0;
            puntos = data.puntos || 0;

            actualizarPuntos();
        }

    }catch(e){
        console.log("Firebase no listo, seguimos");
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
const Juegos = {

    matematicas1:{ generar:()=>calc("+",10) },
    matematicas2:{ generar:()=>calc("-",20) },
    matematicas3:{ generar:()=>calc("*",10) },

    ciencias1:{
        preguntas:[
            {p:"¿Gas que respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"¿Planeta rojo?",r:"marte",tipo:"test",opciones:["marte","tierra","jupiter"]},
            {p:"¿Animal acuático?",r:"pez",tipo:"test",opciones:["pez","perro","gato"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"¿Forma de la Tierra?",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"¿Órgano que late?",r:"corazon",tipo:"test",opciones:["corazón","ojo","mano"]}
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

    zona.innerHTML="";
    input.value="";

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

    preguntaActual.opciones.forEach(op=>{
        const b=document.createElement("button");
        b.innerText=op;
        b.className="btn opcion";

        b.onclick=()=>{
            input.value=op;

            document.querySelectorAll(".opcion")
                .forEach(o=>o.classList.remove("seleccionada"));

            b.classList.add("seleccionada");
        };

        zona.appendChild(b);
    });
}

// =======================================
export function comprobar(){

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    const correcto = levenshtein(r, ok) <= 1;

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos++;
        datos.aciertos++;
    }else{
        resultado.innerText="✘ Incorrecto";
    }

    actualizarPuntos();

    guardarProgreso();
    comprobarRecompensas(datos.aciertos);
    guardarEnFirebase();

    setTimeout(()=>{
        siguientePregunta(); // ✅ IMPORTANTE (NO reinicia juego)
    },1000);
}
