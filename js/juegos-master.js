// =======================================
import { comprobarRecompensas } from "./recompensas.js";

// ✅ PROGRESO GLOBAL
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
// ✅ LEVENSHTEIN (AÑADIDO)
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
// MATEMÁTICAS
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

// =======================================
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

    castellano1:{
        preguntas:[
            "casa","mesa","mango","plato","huevo","lago"
        ].map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones: generarOpciones(p,["casa","mesa","mango","pato","taza","mano"])
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
            {p:"¿Gas que respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"¿Planeta rojo?",r:"marte",tipo:"test",opciones:["marte","tierra","jupiter"]},
            {p:"¿Animal acuático?",r:"pez",tipo:"test",opciones:["pez","perro","gato"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"¿Forma de la Tierra?",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]},
            {p:"¿Dónde viven los peces?",r:"agua",tipo:"test",opciones:["agua","aire","tierra"]},
            {p:"¿El sol es?",r:"estrella",tipo:"test",opciones:["estrella","planeta","luna"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"¿Órgano que late?",r:"corazon",tipo:"test",opciones:["corazón","ojo","mano"]},
            {p:"¿Órgano para ver?",r:"ojo",tipo:"test",opciones:["ojo","pierna","brazo"]},
            {p:"¿Qué respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","humo"]},
            {p:"¿Planeta donde vivimos?",r:"tierra",tipo:"test",opciones:["tierra","marte","saturno"]}
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
    const resultado=document.getElementById("resultado");

    pregunta.innerHTML="";
    zona.innerHTML="";
    resultado.innerHTML="";
    input.value="";

    input.focus();

    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        pregunta.innerText = preguntaActual.p;
        return;
    }

    if(!preguntasRestantes.length){
        preguntasRestantes = [...juegoActual.preguntas];
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText = preguntaActual.p;

    zona.innerHTML="";
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

    else if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value = op;
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

    // ✅ USA LEVENSHTEIN
    const distancia = levenshtein(r, ok);
    const correcto = distancia <= 1;

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos++;
        datos.aciertos++;
    }else{
        resultado.innerText=`✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    animarResultado(resultado, correcto);
    actualizarPuntos();

    guardarProgreso();
    comprobarRecompensas(datos.aciertos);

    setTimeout(()=>{
        iniciarJuego(claveActual);
    },1000);
}
``
