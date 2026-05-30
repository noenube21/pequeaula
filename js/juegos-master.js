// =======================================
// ✅ FIREBASE
import { db, auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const materia = window.materia;
const nivel = window.nivel;

let preguntasRestantes = [];
let puntos = 0;
let juegoActual = null;
let preguntaActual = null;

// =======================================
// LIMPIAR TEXTO
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
function animarResultado(el, ok){
    el.style.transition = "0.3s";
    el.style.transform = "scale(1.2)";
    el.style.color = ok ? "green" : "red";

    setTimeout(() => el.style.transform = "scale(1)", 300);
}

// =======================================
// JSON
async function cargarJSON(){
    try {
        const res = await fetch("js/preguntas.json");
        return await res.json();
    } catch(e){
        console.error("Error JSON:", e);
        return null;
    }
}

// =======================================
// FIREBASE GUARDAR
async function guardarProgreso(){

    const user = auth.currentUser;
    if(!user) return;

    const datosLocal = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0, puntos: 0 };
    const recompensas = JSON.parse(localStorage.getItem("recompensas")) || [];

    await setDoc(doc(db,"usuarios",user.uid),{
        puntos: puntos,
        aciertos: datosLocal.aciertos,
        recompensas: recompensas,
        fecha: new Date()
    });
}

// =======================================
// FIREBASE CARGAR
async function cargarProgreso(){

    const user = auth.currentUser;
    if(!user) return;

    const ref = doc(db,"usuarios",user.uid);
    const snap = await getDoc(ref);

    if(snap.exists()){
        const data = snap.data();
        puntos = data.puntos || 0;

        actualizarPuntos();
    }
}

// =======================================
// MATEMÁTICAS
function calc(op,max){
    let a=Math.floor(Math.random()*max);
    let b=Math.floor(Math.random()*max);

    if(op==="+") return {p:`${a}+${b}`,r:(a+b).toString()};
    if(op==="-") return {p:`${a}-${b}`,r:(a-b).toString()};
    return {p:`${a}×${b}`,r:(a*b).toString()};
}

// =======================================
// MOTOR
export async function iniciarJuego(key){

    await cargarProgreso();

    const dataJSON = await cargarJSON();

    console.log("KEY:", key);
    console.log("JSON:", dataJSON);

    // ✅ MATEMÁTICAS
    if(key.includes("matematicas")){
        juegoActual = {
            generar: () => calc(
                key.includes("1") ? "+" :
                key.includes("2") ? "-" : "*",
                key.includes("1") ? 10 :
                key.includes("2") ? 20 : 10
            )
        };
    }

    // ✅ RESTO
    else {
        if(!dataJSON || !dataJSON[key]){
            console.error("No hay preguntas para:", key);

            // ✅ FALLBACK PARA QUE SIEMPRE FUNCIONE
            juegoActual = {
                preguntas: [
                    {p:"Pregunta de prueba", r:"respuesta", tipo:"input"}
                ]
            };
        } else {
            juegoActual = { preguntas: dataJSON[key] };
        }
    }

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");
    const resultado=document.getElementById("resultado");

    pregunta.innerHTML="";
    zona.innerHTML="";
    resultado.innerHTML="";
    input.value="";
    input.focus();

    // ✅ MATEMÁTICAS
    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        pregunta.innerText = preguntaActual.p;
        return;
    }

    // ✅ PREGUNTAS JSON
    if(!preguntasRestantes.length){
        preguntasRestantes=[...juegoActual.preguntas];
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText=preguntaActual.p;

    zona.innerHTML="";
    input.style.display="none";

    // ✅ TIPOS
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    else if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=preguntaActual.p.replace("_",op).replace(/ /g,"").toLowerCase();

                document.querySelectorAll(".opcion").forEach(x=>x.classList.remove("seleccionada"));
                b.classList.add("seleccionada");
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
                input.value = op;

                document.querySelectorAll(".opcion").forEach(x=>x.classList.remove("seleccionada"));
                b.classList.add("seleccionada");
            };

            zona.appendChild(b);
        });
    }
}

// =======================================
// PUNTOS
export function actualizarPuntos(){
    const score = document.getElementById("score");
    if(score){
        score.innerText = "Puntos: " + puntos;
    }
}

// =======================================
// COMPROBAR
export function comprobar(){

    const btn = document.getElementById("btnComprobar");
    btn.disabled = true;

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    const correcto = r === ok || r.includes(ok) || ok.includes(r);

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos++;
    } else {
        resultado.innerText=`✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    animarResultado(resultado, correcto);
    actualizarPuntos();

    let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0, puntos:0 };

    if(correcto){
        datos.aciertos++;
        datos.puntos++;
    }

    localStorage.setItem("progreso", JSON.stringify(datos));

    guardarProgreso();

    setTimeout(()=>{
        btn.disabled = false;
        iniciarJuego(materia+nivel);
    },1000);
}
