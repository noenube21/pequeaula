// =======================================
// 🔥 IMPORTACIONES FIREBASE
import { db, auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// =======================================
const materia = window.materia;
const nivel = window.nivel;

let preguntasRestantes = [];
let puntos = 0;

// =======================================
// LIMPIAR TEXTO
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
// ANIMACIÓN
function animarResultado(el, ok){
    el.style.transition = "0.3s";
    el.style.transform = "scale(1.2)";
    el.style.color = ok ? "green" : "red";

    setTimeout(() => {
        el.style.transform = "scale(1)";
    }, 300);
}

// =======================================
// BASE DATOS PREGUNTAS
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"]
];

// OPCIONES
function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    const rand = otras.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta,...rand].sort(()=>0.5-Math.random());
}

// =======================================
// JUEGOS
const Juegos = {
    matematicas1:{ generar:()=>calc("+",10) },

    ingles1:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1],inglesBase.map(y=>y[1]))
        }))
    }
};

// =======================================
// FIRESTORE: GUARDAR
async function guardarProgreso(){

    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),{
        puntos: puntos,
        aciertos: JSON.parse(localStorage.getItem("progreso"))?.aciertos || 0,
        fecha: new Date()
    });

}

// =======================================
// FIRESTORE: CARGAR
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
// MOTOR

let juegoActual = null;
let preguntaActual = null;

export function iniciarJuego(key){

    juegoActual = Juegos[key];

    cargarProgreso(); // ✅ cargar datos

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");
    const resultado=document.getElementById("resultado");

    pregunta.innerHTML="";
    zona.innerHTML="";
    resultado.innerHTML="";
    input.value="";
    input.focus();

    if(juegoActual.generar){
        preguntaActual=juegoActual.generar();
        input.style.display="block";
        pregunta.innerText=preguntaActual.p;
        return;
    }

    if(!preguntasRestantes.length){
        preguntasRestantes=[...juegoActual.preguntas];
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText=preguntaActual.p;

    zona.innerHTML="";
    input.style.display="none";

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

    // ✅ comprobación mejorada
    const correcto = r === ok || r.includes(ok) || ok.includes(r);

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos++;
    } else {
        resultado.innerText=`✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    animarResultado(resultado, correcto);

    actualizarPuntos();

    // ✅ LOCAL STORAGE
    let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0, puntos:0 };

    if(correcto){
        datos.aciertos++;
        datos.puntos++;
    }

    localStorage.setItem("progreso", JSON.stringify(datos));

    // ✅ FIRESTORE
    guardarProgreso();

    setTimeout(()=>{
        btn.disabled = false;
        iniciarJuego(materia+nivel);
    },1000);
}

// =======================================
// MATE
function calc(op,max){
    let a=Math.floor(Math.random()*max);
    let b=Math.floor(Math.random()*max);
    if(op==="+") return {p:`${a}+${b}`,r:(a+b).toString()};
    return {p:`${a}-${b}`,r:(a-b).toString()};
}
