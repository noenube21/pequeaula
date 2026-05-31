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

// ✅ SOLO FIREBASE (quitamos dependencia de localStorage)
let datos = {
    aciertos: 0,
    puntos: 0
};

// =======================================
export async function cargarFirebase(){

    const user = auth.currentUser;
    if(!user) return;

    const snap = await getDoc(doc(db, "usuarios", user.uid));

    if(snap.exists()){
        const data = snap.data();

        puntos = data.puntos || 0;
        datos.aciertos = data.aciertos || 0;
    }

    actualizarPuntos();
}

// =======================================
async function guardarEnFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db, "usuarios", user.uid), {
        puntos,
        aciertos: datos.aciertos
    }, { merge:true });
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

    setTimeout(()=>{
        el.style.transform = "scale(1)";
    },300);
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
["milk","leche"],["car","coche"],["water","agua"],["book","libro"]
];

function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    return [correcta,...otras.sort(()=>0.5-Math.random()).slice(0,2)]
        .sort(()=>0.5-Math.random());
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

    castellano1:{
        preguntas:["casa","mesa","mango","plato","huevo","lago"].map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones:["casa","mesa","mango","pato","taza","mano"]
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A",r:"mesa",tipo:"letras",opciones:["e","o","i"]},
            {p:"C _ M A",r:"cama",tipo:"letras",opciones:["a","o","e"]},
            {p:"P _ T O",r:"pato",tipo:"letras",opciones:["a","e","i"]}
        ]
    },

    ciencias1:{
        preguntas:[
            {p:"Gas que respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"Planeta rojo",r:"marte",tipo:"test",opciones:["marte","tierra","venus"]},
            {p:"Animal acuático",r:"pez",tipo:"test",opciones:["pez","gato","perro"]}
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

    actualizarPuntos();

    // ✅ matemáticas
    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        pregunta.innerText = preguntaActual.p;
        return;
    }

    // ✅ cargar TODAS las preguntas una vez
    if(!preguntasRestantes.length){
        preguntasRestantes = [...juegoActual.preguntas];
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

    if(!preguntasRestantes.length){
        pregunta.innerText = "🎉 Nivel completado";
        zona.innerHTML="";
        return;
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),
        1
    )[0];

    pregunta.innerText = preguntaActual.p;

    zona.innerHTML="";
    input.style.display="none";

    if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.onclick=()=>{
                input.value = preguntaActual.p.replace("_", op).replace(/ /g,"");
                comprobar();
            };
            zona.appendChild(b);
        });
    }
    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.onclick=()=>{
                input.value = op;
                comprobar();
            };
            zona.appendChild(b);
        });
    }
}

// =======================================
export async function comprobar(){

    const r = limpiar(document.getElementById("respuesta").value);
    const ok = limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    if(levenshtein(r, ok) <= 1){
        puntos += 10;
        datos.aciertos++;
        resultado.innerText="✅ Correcto";
    }else{
        resultado.innerText=`❌ ${preguntaActual.r}`;
    }

    actualizarPuntos();
    await guardarEnFirebase();

    setTimeout(()=>{
        siguientePregunta();
    },1000);
}
