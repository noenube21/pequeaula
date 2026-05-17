// =======================================
const materia = window.materia;
const nivel = window.nivel;

let preguntasRestantes = [];

// LIMPIAR TEXTO
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// GENERAR OPCIONES
function opciones(correcta, lista){
    const filtradas = lista.filter(x=>x !== correcta);
    const mezcladas = filtradas.sort(()=>0.5 - Math.random()).slice(0,2);
    return [correcta, ...mezcladas].sort(()=>0.5 - Math.random());
}

// =======================================
// BASES GRANDES

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
["¿Planeta rojo?","marte"],
["¿Gas que respiramos?","oxigeno"],
["¿Animal acuático?","pez"],
["¿Necesario para vivir?","agua"],
["¿Forma de la Tierra?","redonda"],
["¿Órgano para ver?","ojo"],
["¿Órgano que late?","corazon"],
["¿Quién hace fotosíntesis?","planta"],
["¿Luz del día?","sol"],
["¿Animal mamífero?","perro"],
["¿Dónde viven los peces?","agua"],
["¿La luna da luz propia?","no"]
];


// =======================================
// JUEGOS

const Juegos = {

    // ========= MATEMÁTICAS =========
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

    // ========= INGLÉS =========
    ingles1:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], inglesBase.map(y=>y[1]))
        }))
    },

    ingles2:{
        preguntas: inglesBase.map(x=>({
            p:`${x[0]} =`,
            r:x[1],
            tipo: Math.random() > 0.5 ? "test" : "input",
            opciones: opciones(x[1], inglesBase.map(y=>y[1]))
        }))
    },

    // 🔥 INGLÉS INVERSO
    ingles3:{
        preguntas: inglesBase.map(x=>({
            p:`${x[1]} =`,
            r:x[0],
            tipo:"test",
            opciones: opciones(x[0], inglesBase.map(y=>y[0]))
        }))
    },

    // ========= CIENCIAS =========
    ciencias1:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], cienciasBase.map(y=>y[1]))
        }))
    },

    ciencias2:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"vf",
            opciones:["sí","no"]
        }))
    },

    ciencias3:{
        preguntas: cienciasBase.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"input"
        }))
    },

    // ========= CASTELLANO =========
    castellano1:{
        preguntas:["casa","mesa","mango","plato","huevo","lago","coche","cama"]
        .map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones: opciones(p,["cosa","pato","mesa","lata"])
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
            {p:"¿Verbo?",r:"correr"},
            {p:"¿Sustantivo?",r:"mesa"},
            {p:"¿Verbo?",r:"leer"},
            {p:"¿Sustantivo?",r:"gato"}
        ].map(x=>({
            ...x,
            tipo:"test",
            opciones: opciones(x.r,["mesa","perro","correr","leer"])
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

    // MATEMÁTICAS
    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        input.style.display="block";
        pregunta.innerText = preguntaActual.p;
        return;
    }

    // ANTIREPETICIÓN REAL
    if(!preguntasRestantes.length){
        preguntasRestantes = [...juegoActual.preguntas];
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText = preguntaActual.p;

    zona.innerHTML="";
    input.style.display="none";

    // INPUT
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    // TEST / VF (botones)
    else{
        preguntaActual.opciones.forEach(op=>{
            const btn=document.createElement("button");
            btn.innerText=op;
            btn.className="btn";
            btn.style.display="block";
            btn.style.margin="10px auto";

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
