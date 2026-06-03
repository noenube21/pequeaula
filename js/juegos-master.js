import { comprobarRecompensas } from "./recompensas.js";
import { guardarProgreso as guardarFirestore, cargarProgreso } from "./progreso.js";

// =======================================
let preguntasRestantes = [];
let puntos = 0;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let usadas = [];

// ✅ PROGRESO GLOBAL
let datos = {
    aciertos: 0,
    puntos: 0
};

// =======================================
// 🔥 FIREBASE: CARGAR USUARIO
export async function cargarDatosUsuario(){

    const remoto = await cargarProgreso();

    if(remoto){
        datos = remoto;
    }else{
        datos = JSON.parse(localStorage.getItem("progreso")) || {
            aciertos: 0,
            puntos: 0
        };
    }

    puntos = datos.puntos || 0;
    actualizarPuntos();
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
function actualizarPuntos(){
    const score = document.getElementById("score");
    if(score){
        score.innerText = "Puntos: " + puntos;
    }
}

// =======================================
async function guardarTodo(){
    datos.puntos = puntos;

    localStorage.setItem("progreso", JSON.stringify(datos));

    await guardarFirestore(datos);
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
const castellanoBase = [
["árbol","arbol"],
["camión","camion"],
["corazón","corazon"],
["lápiz","lapiz"],
["teléfono","telefono"],
["canción","cancion"]
];

const cienciasBase = [
["¿Planeta más cercano al Sol?","mercurio"],
["¿Gas que respiramos?","oxigeno"],
["¿Satélite de la Tierra?","luna"],
["¿Estado sólido del agua?","hielo"],
["¿Estrella principal?","sol"]
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
            opciones: generarOpciones(x[1], inglesBase.map(y=>y[1]))
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
            p:`Traduce: ${x[1]}`,
            r:x[0],
            tipo:"input"
        }))
    },

    castellano1:{
        preguntas: castellanoBase.map(x=>({
            p:`Escribe correctamente: ${x[1]}`,
            r:x[0],
            tipo:"input"
        }))
    },

    castellano2:{
        preguntas:[
            { p:"¿Cuál es un sustantivo?", r:"mesa", tipo:"test", opciones:["mesa","correr","rojo"] },
            { p:"¿Cuál es un verbo?", r:"correr", tipo:"test", opciones:["correr","mesa","rápido"] }
        ]
    },

    castellano3:{
        preguntas:[
            { p:"Completa: El perro ___ en el parque", r:"corre", tipo:"input" },
            { p:"Completa: La niña ___ un libro", r:"lee", tipo:"input" }
        ]
    },

    ciencias1:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"input"
        }))
    },

    ciencias2:{
        preguntas:[
            { p:"¿Qué planeta es rojo?", r:"marte", tipo:"test", opciones:["marte","venus","jupiter"] },
            { p:"¿Órgano que bombea sangre?", r:"corazon", tipo:"test", opciones:["corazon","pulmon","higado"] }
        ]
    },

    ciencias3:{
        preguntas:[
            { p:"Fórmula del agua", r:"h2o", tipo:"input" },
            { p:"Fuerza de gravedad", r:"gravedad", tipo:"input" }
        ]
    }
};

// =======================================
export function iniciarJuego(key){

    claveActual = key;
    juegoActual = Juegos[key];

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const input = document.getElementById("respuesta");
    const resultado = document.getElementById("resultado");

    pregunta.innerHTML = "";
    zona.innerHTML = "";
    resultado.innerHTML = "";
    input.value = "";

    if(!juegoActual){
        pregunta.innerText = `Nivel no encontrado: ${key}`;
        return;
    }

    actualizarPuntos();

    // ✅ RESET cuando se acaban
    if(usadas.length >= (juegoActual.preguntas || []).length){
        usadas = [];
    }

    preguntasRestantes = (juegoActual.preguntas || []).filter(p => !usadas.includes(p));

    if(preguntasRestantes.length === 0){
        usadas = [];
        preguntasRestantes = [...juegoActual.preguntas];
    }

    preguntaActual = preguntasRestantes[Math.floor(Math.random() * preguntasRestantes.length)];

    if(!preguntaActual){
        pregunta.innerText = "Error cargando pregunta";
        return;
    }

    usadas.push(preguntaActual);

    pregunta.innerText = preguntaActual.p;

    input.style.display = "none";

    if(preguntaActual.tipo === "input"){
        input.style.display = "block";
    } else {
        (preguntaActual.opciones || []).forEach(op=>{
            const b = document.createElement("button");
            b.innerText = op;
            b.classList.add("opcion");

            b.onclick = ()=>{
                document.querySelectorAll("#zona .opcion")
                    .forEach(btn => btn.classList.remove("seleccionada"));

                b.classList.add("seleccionada");
                input.value = op;
            };

            zona.appendChild(b);
        });
    }
}

// =======================================
export async function comprobar(){

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    const correcto = levenshtein(r, ok) <= 1;

    if(correcto){
        puntos++;
        datos.aciertos++;
        resultado.innerText="✔ Correcto";
    }else{
        resultado.innerText=`✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    actualizarPuntos();
    await guardarTodo();
    comprobarRecompensas(datos.aciertos);

    setTimeout(()=>{
        iniciarJuego(claveActual);
    },500);
}
``
