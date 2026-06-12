import { comprobarRecompensas } from "./recompensas.js";

// =======================================
let datosCargados = false;
let preguntaActual = null;
let juegoActual = null;
let claveActual = "";
let usadas = {};

// 🔥 PROGRESO POR NIVEL
let datos = {
    aciertos: 0,
    puntosPorNivel: {}
};

// =======================================
// 
export async function cargarDatosUsuario(){

    if(datosCargados) return;

    datosCargados = true;

    const email = window.auth?.currentUser?.email;

    datos = {
        aciertos: 0,
        puntosPorNivel: {},
        historial: []
    };

    if(
        email &&
        window.cargarProgresoSupabase
    ){

        const filas =
            await window.cargarProgresoSupabase(
                email
            );

        console.log("EMAIL:", email);
        console.log("FILAS:", filas);

        filas.forEach(fila => {

            datos.puntosPorNivel[
                fila.juego
            ] = Number(fila.puntos) || 0;

        });

        console.log(
            "DATOS CARGADOS DESDE SUPABASE",
            datos
        );

    } else {

        const local =
            JSON.parse(
                localStorage.getItem("progreso")
            ) || {};

        datos = {
            ...datos,
            ...local
        };
    }

    window.datos = datos;
}
// =======================================

function limpiar(t){
    return (t || "")
        .toLowerCase()
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

function obtenerPuntosNivel(){
    if(!datos.puntosPorNivel[claveActual]){
        datos.puntosPorNivel[claveActual] = 0;
    }
    return datos.puntosPorNivel[claveActual];
}

function sumarPunto(){
    datos.puntosPorNivel[claveActual] =
        obtenerPuntosNivel() + 1;

    datos.historial.push({
        nivel: claveActual,
        fecha: Date.now()
    });
}

// =======================================

function actualizarPuntos(){
    const score = document.getElementById("score");

    if(score){
        score.innerHTML =
            `Puntos: ${obtenerPuntosNivel()} | Global: ${
                Object.values(datos.puntosPorNivel || {})
                    .reduce((a,b)=>a + (Number(b) || 0), 0)
            }`;
    }
}

// =======================================
async function guardarTodo(){

    localStorage.setItem(
        "progreso",
        JSON.stringify(datos)
    );

    console.log("guardarTodo ejecutado");

    console.log(
        "window.guardarProgreso:",
        window.guardarProgreso
    );

    if(window.guardarProgreso){

        const email = window.auth?.currentUser?.email;

        console.log(
            "PUNTOS ACTUALES:",
            obtenerPuntosNivel()
        );

        const resultado =
            await window.guardarProgreso(
                email,
                claveActual,
                1,
                obtenerPuntosNivel()
            );

        console.log(
            "RESULTADO GUARDADO:",
            resultado
        );

    } else {

        console.log(
            "window.guardarProgreso NO EXISTE"
        );
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
// 📚 BASES

const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["house","casa"],["tree","árbol"],["food","comida"],["school","escuela"],
["friend","amigo"],["happy","feliz"],["sad","triste"]
];

const castellanoBase = [
["árbol","arbol"],["camión","camion"],["corazón","corazon"],
["lápiz","lapiz"],["teléfono","telefono"],["canción","cancion"],
["niño","nino"],["mañana","manana"],["león","leon"]
];

const cienciasBase = [
["¿Cuál es el planeta cercano al Sol?","mercurio"],
["¿Cuál es el planeta más grande del sistema solar?","jupiter"],
["¿Cuál es el planeta rojo?","marte"],
["¿Qué gas respiramos?","oxigeno"],
["¿Satélite de la Tierra?","luna"],
["¿Estrella principal del sistema solar?","sol"],
["¿Líquido esencial para la vida?","agua"],
["¿Órgano que bombea la sangre?","corazon"]
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
        preguntas:[
            { p:"¿Cuál es un sustantivo?", r:"mesa", tipo:"test", opciones:["mesa","correr","rápido"] },
            { p:"¿Cuál es un verbo?", r:"correr", tipo:"test", opciones:["correr","mesa","azul"] }
        ]
    },

    castellano2:{
        preguntas:[
            { p:"¿Cuál es un sustantivo?", r:"mesa", tipo:"test", opciones:["mesa","correr","rojo"] },
            { p:"¿Cuál es un verbo?", r:"correr", tipo:"test", opciones:["correr","mesa","rápido"] },
            { p:"¿Cuál es un adjetivo?", r:"azul", tipo:"test", opciones:["azul","mesa","correr"] },
            { p:"¿Cuál es un sustantivo?", r:"coche", tipo:"test", opciones:["coche","cantar","feliz"] },
            { p:"¿Cuál es un verbo?", r:"comer", tipo:"test", opciones:["comer","mesa","rojo"] },
            { p:"¿Cuál es un adjetivo?", r:"rápido", tipo:"test", opciones:["rápido","coche","correr"] }
        ]
    },

    castellano3:{
        preguntas:[
            { p:"¿Qué es un animal?", r:"perro", tipo:"test", opciones:["perro","mesa","azul"] },
            { p:"¿Qué es una acción?", r:"correr", tipo:"test", opciones:["correr","rojo","mesa"] },
            { p:"¿Qué es un objeto?", r:"mesa", tipo:"test", opciones:["mesa","feliz","cantar"] },
            { p:"¿Qué es un animal?", r:"gato", tipo:"test", opciones:["gato","mesa","rojo"] },
            { p:"¿Qué es una acción?", r:"saltar", tipo:"test", opciones:["saltar","azul","mesa"] },
            { p:"¿Qué es un objeto?", r:"silla", tipo:"test", opciones:["silla","correr","feliz"] }
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
            { p:"¿Cuál es el planeta rojo?", r:"marte", tipo:"test", opciones:["marte","venus","jupiter"] },
            { p:"¿Cuál es el planeta más caliente?", r:"venus", tipo:"test", opciones:["venus","mercurio","tierra"] },
            { p:"¿Cuál es el planeta más grande?", r:"jupiter", tipo:"test", opciones:["jupiter","saturno","marte"] },
            { p:"¿Qué planeta tiene anillos?", r:"saturno", tipo:"test", opciones:["saturno","marte","venus"] },
            { p:"¿Cuál es el planeta azul?", r:"tierra", tipo:"test", opciones:["tierra","marte","venus"] }
        ]
    },

    ciencias3:{
        preguntas:[
            { p:"¿Cuál es la fórmula del agua?", r:"h2o", tipo:"test", opciones:["h2o","co2","o2"] },
            { p:"¿Qué gas respiramos?", r:"oxigeno", tipo:"test", opciones:["oxigeno","co2","nitrógeno"] },
            { p:"¿Qué gas expulsamos?", r:"co2", tipo:"test", opciones:["co2","oxigeno","hidrogeno"] },
            { p:"¿Cuál es la estrella del sistema solar?", r:"sol", tipo:"test", opciones:["sol","luna","marte"] }
        ]
    },

    valenciano1:{
        preguntas:[]
    }
};

// =======================================
// 🌍 CARGA VALENCIANO DESDE JSON

export async function cargarValenciano(){

    try {
        const res = await fetch("./js/valenciano.json");
        const data = await res.json();

        if(data?.valenciano1){
            Juegos.valenciano1.preguntas = data.valenciano1;
        }

        console.log("Valenciano cargado ✔");

    } catch (e) {
        console.error("Error cargando valenciano:", e);
    }
}

cargarValenciano();

// =======================================
// 🚀 INICIAR JUEGO
export async function iniciarJuego(key){

    claveActual = key;

    await cargarDatosUsuario();

    juegoActual = Juegos[key];

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const input = document.getElementById("respuesta");
    const resultado = document.getElementById("resultado");

    if(!juegoActual){
        pregunta.innerText = "Nivel no encontrado";
        return;
    }

    pregunta.innerHTML = "";
    zona.innerHTML = "";
    resultado.innerHTML = "";
    input.value = "";

    actualizarPuntos();

    if(juegoActual.generar){

        const gen = juegoActual.generar();

        preguntaActual = {
            p: gen.p,
            r: String(gen.r),
            tipo: "input"
        };

    } else {

        if(!usadas[key]) usadas[key] = new Set();

        let lista = juegoActual.preguntas || [];
        let disponibles = lista.filter(p => !usadas[key].has(p.p));

        if(disponibles.length === 0){
            usadas[key].clear();
            disponibles = [...lista];
        }

        preguntaActual =
            disponibles[
                Math.floor(Math.random()*disponibles.length)
            ];

        usadas[key].add(preguntaActual.p);
    }

    pregunta.innerText = preguntaActual.p;

    input.style.display =
        (preguntaActual.tipo === "input")
        ? "block"
        : "none";

    zona.innerHTML = "";

    if(preguntaActual.tipo === "test"){

        preguntaActual.opciones.forEach(op=>{

            const b = document.createElement("button");

            b.innerText = op;
            b.classList.add("opcion");

            b.onclick = ()=>{

                document
                    .querySelectorAll("#zona .opcion")
                    .forEach(btn =>
                        btn.classList.remove("seleccionada")
                    );

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
        sumarPunto();
        datos.aciertos++;
        resultado.innerText = "✔ Correcto";
    } else {
        resultado.innerText = "✘ Incorrecto. Respuesta correcta: " + preguntaActual.r;
    }

    actualizarPuntos();
    await guardarTodo();

    setTimeout(()=>{
        iniciarJuego(claveActual);
    },500);
