// =======================================
const materia = window.materia;
const nivel = window.nivel;

let preguntasRestantes = [];

// ✅ LIMPIAR TEXTO
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
// BASES DE DATOS (MUCHAS PREGUNTAS)

const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["tree","árbol"],["chair","silla"],["food","comida"],["fish","pez"],
["flower","flor"],["house","casa"],["door","puerta"],
["window","ventana"],["cold","frio"],["hot","caliente"],
["happy","feliz"],["big","grande"],["small","pequeño"],
["fast","rápido"],["slow","lento"],["light","luz"],
["dark","oscuro"],["sky","cielo"],["earth","tierra"],
["fire","fuego"],["air","aire"]
];

const cienciasBase = [
["¿Gas que respiramos?","oxigeno",["oxígeno","agua","fuego"]],
["¿Planeta rojo?","marte",["marte","tierra","jupiter"]],
["¿Animal acuático?","pez",["pez","perro","gato"]],
["¿Necesario para vivir?","agua",["agua","metal","plástico"]],
["¿Forma de la Tierra?","redonda",["redonda","plana","cuadrada"]],
["¿Órgano para ver?","ojo",["ojo","pierna","brazo"]],
["¿Órgano que late?","corazon",["corazón","mano","pie"]],
["¿Qué respiramos?","oxigeno",["oxígeno","agua","humo"]],
["¿Astro que da luz?","sol",["sol","luna","tierra"]],
["¿Dónde viven los peces?","agua",["agua","tierra","aire"]]
];

// =======================================
// GENERADOR DE OPCIONES
function generarOpciones(correcta, lista){
    const incorrectas = lista.filter(x => x !== correcta);
    const random = incorrectas.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta, ...random].sort(()=>0.5-Math.random());
}

// =======================================
// JUEGOS
const Juegos = {

    // ================= MATEMÁTICAS =================
    matematicas1:{
        generar:()=>{
            let a=Math.floor(Math.random()*10);
            let b=Math.floor(Math.random()*10);
            return {p:`${a}+${b}`,r:(a+b).toString()};
        }
    },

    matematicas2:{
        generar:()=>{
            let a=Math.floor(Math.random()*20);
            let b=Math.floor(Math.random()*10);
            return {p:`${a}-${b}`,r:(a-b).toString()};
        }
    },

    matematicas3:{
        generar:()=>{
            let a=Math.floor(Math.random()*10);
            let b=Math.floor(Math.random()*10);
            return {p:`${a}×${b}`,r:(a*b).toString()};
        }
    },

    // ================= INGLÉS =================
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
            tipo: Math.random()>0.5 ? "test" : "input",
            opciones: generarOpciones(x[1], inglesBase.map(y=>y[1]))
        }))
    },

    // 🔥 INGLÉS AL REVÉS
    ingles3:{
        preguntas: inglesBase.map(x=>({
            p:`${x[1]} =`,
            r:x[0],
            tipo:"test",
            opciones: generarOpciones(x[0], inglesBase.map(y=>y[0]))
        }))
    },

    // ================= CIENCIAS =================
    ciencias1:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"test",
            opciones:x[2]
        }))
    },

    ciencias2:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"test",
            opciones:x[2]
        }))
    },

    ciencias3:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"input"
        }))
    },

    // ================= CASTELLANO =================
    castellano1:{
        preguntas:["casa","mesa","mango","plato","huevo","lago","coche","cama"]
        .map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones: generarOpciones(p,["casa","mesa","mango","lata","poco"])
        }))
    },

    castellano2:{
        preguntas:["cama","mano","sopa","lago","bola","foco"]
        .map(p=>({
            p:`${p.slice(0,2)}__${p.slice(3)}`,
            r:p,
            tipo:"input"
        }))
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",op:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa",op:["mesa","leer","correr"]},
            {p:"¿Verbo?",r:"leer",op:["leer","silla","puerta"]}
        ].map(x=>({
            p:x.p,
            r:x.r,
            tipo:"test",
            opciones:x.op
        }))
    }
};


// =======================================
// MOTOR
let juegoActual=null;
let preguntaActual=null;

export function iniciarJuego(key){

    juegoActual = Juegos[key];

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const input = document.getElementById("respuesta");
    const resultado = document.getElementById("resultado");

    pregunta.innerHTML="";
    zona.innerHTML="";
    resultado.innerHTML="";
    input.value="";

    document.getElementById("btnComprobar").onclick = comprobar;

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


    // ✅ INPUT
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    // ✅ TEST
    else{
        preguntaActual.opciones.forEach(op=>{
            const btn=document.createElement("button");
            btn.innerText=op;
            btn.className="btn";

            btn.style.display="block";
            btn.style.margin="10px auto";
            btn.style.padding="12px";
            btn.style.fontSize="16px";
            btn.style.borderRadius="10px";

            btn.onclick=()=>{
                input.value=op;
                comprobar();
            };

            zona.appendChild(btn);
        });
    }
}


// =======================================
// COMPROBAR
export function comprobar(){

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);

    const resultado=document.getElementById("resultado");

    const correcto = r===ok;

    resultado.innerText = correcto ? "✔ Correcto" : "✘ Incorrecto";

    import("./progreso.js").then(mod=>{
        mod.registrarResultado(
            materia+nivel,
            correcto?1:0,
            correcto?0:1
        );
    });

    setTimeout(()=>iniciarJuego(materia+nivel),800);
}
``
