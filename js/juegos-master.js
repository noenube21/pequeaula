import { db, auth } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// =======================================
const materia = window.materia;
const nivel = window.nivel;

let preguntasRestantes = [];
let puntos = 0; // ✅ NUEVO

// ✅ LIMPIAR TEXTO
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
// ANIMACIÓN SIMPLE
function animarResultado(el, ok){
    el.style.transition = "0.3s";
    el.style.transform = "scale(1.2)";
    el.style.color = ok ? "green" : "red";

    setTimeout(() => {
        el.style.transform = "scale(1)";
    }, 300);
}

// =======================================
// BASES

const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["tree","árbol"],["chair","silla"],["food","comida"],["fish","pez"],
["flower","flor"],["house","casa"],["door","puerta"],
["window","ventana"],["cold","frio"],["hot","caliente"],
["happy","feliz"],["sad","triste"],["big","grande"],["small","pequeño"],
["fast","rápido"],["slow","lento"],["light","luz"],
["dark","oscuro"],["sky","cielo"],["earth","tierra"]
];

// generar opciones
function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    const rand = otras.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta,...rand].sort(()=>0.5-Math.random());
}

// =======================================
// JUEGOS

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
    }
};

// =======================================
// MOTOR

let juegoActual=null;
let preguntaActual=null;

export function iniciarJuego(key){

    juegoActual = Juegos[key];

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");
    const resultado=document.getElementById("resultado");

    pregunta.innerHTML="";
    zona.innerHTML="";
    resultado.innerHTML="";
    input.value="";

    // ✅ foco en input
    input.focus();

    document.getElementById("btnComprobar").onclick=comprobar;

    // matematicas
    if(juegoActual.generar){
        preguntaActual=juegoActual.generar();
        input.style.display="block";
        pregunta.innerText=preguntaActual.p;
        return;
    }

    if(!preguntasRestantes.length){
        preguntasRestantes=[...juegoActual.preguntas];
    }

    preguntaActual=preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText=preguntaActual.p;

    zona.innerHTML="";
    input.style.display="none";

    // test
    preguntaActual.opciones.forEach(op=>{
        const b=document.createElement("button");
        b.innerText=op;
        b.className="btn opcion";

        b.onclick=()=>{
            input.value = op;

            // quitar selección anterior ✅
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
    btn.disabled = true; // ✅ evita spam

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    // ✅ mejora comparación (más flexible)
    const correcto = r === ok || r.includes(ok) || ok.includes(r);

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos++; // ✅ suma puntos
    }else{
        resultado.innerText=`✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    animarResultado(resultado, correcto);

    // ✅ ACTUALIZAR MARCADOR
    actualizarPuntos();

    // ✅ GUARDAR DATOS
    let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0, puntos:0 };

    if (correcto) {
        datos.aciertos += 1;
        datos.puntos += 1;
    }

    localStorage.setItem("progreso", JSON.stringify(datos));

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
    if(op==="-") return {p:`${a}-${b}`,r:(a-b).toString()};
    return {p:`${a}×${b}`,r:(a*b).toString()};
}
