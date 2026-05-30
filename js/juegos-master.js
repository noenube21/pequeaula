import { db, auth } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const materia = window.materia;
const nivel = window.nivel;

let puntos = 0;
let preguntaActual = null;
let preguntas = [];

// =======================================
// LIMPIAR TEXTO
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
// PUNTOS
function actualizarPuntos(){
    const score = document.getElementById("score");
    if(score){
        score.innerText = "Puntos: " + puntos;
    }
}

// =======================================
// GUARDAR FIREBASE
async function guardarProgreso(){

    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),{
        puntos: puntos,
        fecha: new Date()
    });
}

// =======================================
// CARGAR JSON
async function cargarPreguntas(key){

    try{
        const res = await fetch("js/preguntas.json");
        const data = await res.json();

        if(data[key]){
            preguntas = data[key];
        } else {
            console.log("No existe clave:", key);
            preguntas = [
                {p:"Pregunta test", r:"respuesta", tipo:"input"}
            ];
        }

    }catch(e){
        console.log("Error JSON", e);
        preguntas = [
            {p:"Error cargando", r:"error", tipo:"input"}
        ];
    }

}

// =======================================
// INICIAR JUEGO
export async function iniciarJuego(key){

    await cargarPreguntas(key);

    siguientePregunta();
}

// =======================================
// SIGUIENTE PREGUNTA
function siguientePregunta(){

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    input.value="";
    zona.innerHTML="";

    preguntaActual = preguntas[Math.floor(Math.random()*preguntas.length)];

    pregunta.innerText = preguntaActual.p;

    input.style.display="none";

    // input
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    // letras
    else if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=preguntaActual.p.replace("_",op).replace(/ /g,"").toLowerCase();
                marcarSeleccion(b);
            };

            zona.appendChild(b);
        });
    }

    // test
    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=op;
                marcarSeleccion(b);
            };

            zona.appendChild(b);
        });
    }

}

// =======================================
// SELECCIÓN VISUAL
function marcarSeleccion(btn){
    document.querySelectorAll(".opcion").forEach(x=>x.classList.remove("seleccionada"));
    btn.classList.add("seleccionada");
}

// =======================================
// COMPROBAR
export function comprobar(){

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);

    const resultado=document.getElementById("resultado");

    if(r===ok){
        resultado.innerText="✔ Correcto";
        puntos++;
    } else {
        resultado.innerText="✘ Incorrecto";
    }

    actualizarPuntos();
    guardarProgreso();

    setTimeout(()=>{
        siguientePregunta();
    },1000);
}
