import { comprobarRecompensas } from "./recompensas.js";
import { guardarProgreso as guardarFirestore, cargarProgreso } from "./progreso.js";

// =======================================

let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let usadas = {};

// ✅ PROGRESO GLOBAL
let datos = {
    aciertos: 0,
    puntos: 0
};

// =======================================
// 🔥 CARGAR PROGRESO (FIX REAL GLOBAL)
export async function cargarDatosUsuario(){

    const remoto = await cargarProgreso();
    const local = JSON.parse(localStorage.getItem("progreso"));

    datos = {
        aciertos: 0,
        puntos: 0,
        ...(local || {}),
        ...(remoto || {})
    };

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
        score.innerText = "Puntos: " + datos.puntos;
    }
}

// =======================================
async function guardarTodo(){

    localStorage.setItem("progreso", JSON.stringify(datos));

    try {
        await guardarFirestore(datos);
    } catch (e) {
        console.warn("Firestore error:", e);
    }
}

// =======================================
// 📊 MATEMÁTICAS (SIN CAMBIOS)
function calc(op,max){

    let a=Math.floor(Math.random()*max);
    let b=Math.floor(Math.random()*max);

    if(op==="+") return {p:`${a} + ${b}`,r:(a+b).toString()};
    if(op==="-") return {p:`${a} - ${b}`,r:(a-b).toString()};
    return {p:`${a} × ${b}`,r:(a*b).toString()};
}

// =======================================
// 📚 BASES AMPLIADAS

const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["house","casa"],["tree","árbol"],["food","comida"],["school","escuela"],
["friend","amigo"],["happy","feliz"],["sad","triste"],["run","correr"],
["eat","comer"],["drink","beber"],["sleep","dormir"],["play","jugar"],
["work","trabajar"],["study","estudiar"],["teacher","profesor"],
["student","estudiante"],["city","ciudad"],["country","país"],
["big","grande"],["small","pequeño"],["fast","rápido"],["slow","lento"],
["hot","caliente"],["cold","frío"],["new","nuevo"],["old","viejo"],
["day","día"],["night","noche"],["time","tiempo"],["hand","mano"],
["foot","pie"],["head","cabeza"],["eye","ojo"],["mouth","boca"],
["love","amor"],["family","familia"],["name","nombre"],["light","luz"]
];

const castellanoBase = [
["árbol","arbol"],["camión","camion"],["corazón","corazon"],
["lápiz","lapiz"],["teléfono","telefono"],["canción","cancion"],
["ratón","raton"],["avión","avion"],["campeón","campeon"],
["niño","nino"],["mañana","manana"],["león","leon"],
["acción","accion"],["fácil","facil"],["difícil","dificil"],
["país","pais"],["jamón","jamon"],["colchón","colchon"],
["educación","educacion"],["información","informacion"],
["computación","computacion"],["dirección","direccion"],
["situación","situacion"],["expresión","expresion"],
["organización","organizacion"],["televisión","television"],
["corrección","correccion"],["solución","solucion"],
["reacción","reaccion"],["nación","nacion"]
];

const cienciasBase = [
["¿Planeta más cercano al Sol?","mercurio"],
["¿Gas que respiramos?","oxigeno"],
["¿Satélite de la Tierra?","luna"],
["¿Estado sólido del agua?","hielo"],
["¿Estrella principal?","sol"],
["¿Planeta rojo?","marte"],
["¿Planeta más grande?","jupiter"],
["¿Planeta con anillos?","saturno"],
["¿Órgano que bombea sangre?","corazon"],
["¿Órgano del pensamiento?","cerebro"],
["¿Gas de las plantas?","co2"],
["¿Proceso de plantas?","fotosintesis"],
["¿Unidad de vida?","celula"],
["¿Fuerza gravedad?","gravedad"],
["¿Animal que da leche?","vaca"],
["¿Estado del agua a vapor?","evaporacion"],
["¿Estado del agua a líquido?","condensacion"],
["¿Capa protectora Tierra?","ozono"],
["¿Planeta donde vivimos?","tierra"],
["¿Sistema sanguíneo?","circulatorio"],
["¿Órgano respiración?","pulmones"]
];

// =======================================
function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    const rand = otras.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta,...rand].sort(()=>0.5-Math.random());
}

// =======================================
// 🎮 JUEGOS
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
// 🚀 INICIAR JUEGO
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
        pregunta.innerText = "Nivel no encontrado";
        return;
    }

    actualizarPuntos();

    if(juegoActual.generar){

        const gen = juegoActual.generar();

        preguntaActual = {
            p: gen.p,
            r: String(gen.r),
            tipo: "input"
        };

    } else {

        if(!usadas[key]) usadas[key] = [];

        const lista = juegoActual.preguntas || [];

        if(usadas[key].length >= lista.length){
            usadas[key] = [];
        }

        let disponibles = lista.filter(p => !usadas[key].includes(p));

        if(disponibles.length === 0){
            usadas[key] = [];
            disponibles = [...lista];
        }

        preguntaActual = disponibles[Math.floor(Math.random() * disponibles.length)];

        usadas[key].push(preguntaActual);
    }

    pregunta.innerText = preguntaActual.p;

    input.style.display = "none";
    zona.innerHTML = "";

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
// ✅ COMPROBAR
export async function comprobar(){

    const r = limpiar(document.getElementById("respuesta").value);
    const ok = limpiar(preguntaActual.r);
    const resultado = document.getElementById("resultado");

    const correcto = levenshtein(r, ok) <= 1;

    if(correcto){
        datos.puntos++;
        datos.aciertos++;
        resultado.innerText = "✔ Correcto";
    } else {
        resultado.innerText = `✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    actualizarPuntos();
    await guardarTodo();
    comprobarRecompensas(datos.aciertos);

    setTimeout(()=>{
        iniciarJuego(claveActual);
    },500);
}
