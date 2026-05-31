import { comprobarRecompensas } from "./recompensas.js";

// ✅ FIREBASE IMPORTS
import { getDoc, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db, auth } from "../firebase-config.js";

// =======================================
let preguntasRestantes = [];
let puntos = 0;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";

// ✅ FIX: bloqueo anti spam
let bloqueado = false;

// ✅ PROGRESO GLOBAL
let datos = JSON.parse(localStorage.getItem("progreso")) || {
    aciertos: 0,
    puntos: 0
};

// ✅ FIX: NO usar local como base principal
puntos = 0;

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
    }

    // ✅ FIX: sincronizar siempre
    datos.puntos = puntos;
    localStorage.setItem("progreso", JSON.stringify(datos));

    actualizarPuntos();
}

// =======================================
async function guardarEnFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db, "usuarios", user.uid), {
        puntos: puntos,
        aciertos: datos.aciertos
    }, { merge: true });
}

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

    for (let i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }

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
function animarResultado(el, ok){
    el.style.transition = "0.3s";
    el.style.transform = "scale(1.2)";
    el.style.color = ok ? "green" : "red";

    setTimeout(() => {
        el.style.transform = "scale(1)";
    }, 300);
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
["milk","leche"],["car","coche"],["water","agua"],["book","libro"]
];

function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    const rand = otras.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta,...rand].sort(()=>0.5-Math.random());
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

    // (TODOS LOS DEMÁS TAL CUAL COMO TENÍAS)
};

// =======================================
export function iniciarJuego(key){

    claveActual = key;
    juegoActual = Juegos[key];

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");
    const resultado=document.getElementById("resultado");

    pregunta.innerHTML="";
    zona.innerHTML="";
    resultado.innerHTML="";
    input.value="";

    input.focus();
    actualizarPuntos();

    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        pregunta.innerText = preguntaActual.p;
        return;
    }

    // ✅ FIX: solo cargar la primera vez
    if(!preguntasRestantes.length){
        preguntasRestantes = [...juegoActual.preguntas];
    }

    siguientePregunta(); // ✅ FIX
}

// =======================================
function siguientePregunta(){

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    bloqueado = false; // ✅ desbloquear

    if(preguntasRestantes.length === 0){
        pregunta.innerText = "🎉 Nivel completado";
        zona.innerHTML = "";
        return;
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText = preguntaActual.p;

    zona.innerHTML="";
    input.style.display="none";
}

// =======================================
export function comprobar(){

    if(bloqueado) return; // ✅ FIX
    bloqueado = true;

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    const correcto = levenshtein(r, ok) <= 1;

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos += 1; // ✅ FIX: de 1 en 1
        datos.aciertos++;
    }else{
        resultado.innerText=`✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    animarResultado(resultado, correcto);
    actualizarPuntos();

    guardarProgreso();
    comprobarRecompensas(datos.aciertos);
    guardarEnFirebase();

    // ✅ FIX: NO reiniciar juego
    setTimeout(()=>{
        siguientePregunta();
    },1000);
}
