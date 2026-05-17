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

// ANIMACIÓN
function animarResultado(el, ok){
    el.style.transition = "0.3s";
    el.style.transform = "scale(1.2)";
    el.style.color = ok ? "green" : "red";

    setTimeout(() => {
        el.style.transform = "scale(1)";
    }, 300);
}

// BASE INGLÉS
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["tree","árbol"],["chair","silla"],["food","comida"],["fish","pez"]
];

// GENERAR OPCIONES
function generarOpciones(correcta, lista){
    const otras = lista.filter(x => x !== correcta);
    const rand = otras.sort(()=>0.5-Math.random()).slice(0,2);
    return [correcta,...rand].sort(()=>0.5-Math.random());
}

// =======================================
// JUEGOS
const Juegos = {

    matematicas1:{ generar:()=>calc("+",10)},
    matematicas2:{ generar:()=>calc("-",20)},
    matematicas3:{ generar:()=>calc("*",10)},

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
            p:`${x[1]} =`,
            r:x[0],
            tipo:"test",
            opciones: generarOpciones(x[0], inglesBase.map(y=>y[0]))
        }))
    },

    castellano1:{
        preguntas:[
            "casa","mesa","mango","plato"
        ].map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones: generarOpciones(p,["casa","mesa","mango"])
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"¿Órgano que late?",r:"corazon",tipo:"test",opciones:["corazón","ojo","mano"]},
            {p:"¿Astro que da luz?",r:"sol",tipo:"test",opciones:["sol","luna","tierra"]}
        ]
    }
};


// =======================================
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

    // NO REPETIR
    if(!preguntasRestantes.length){
        preguntasRestantes = [...juegoActual.preguntas];
    }

    preguntaActual = preguntasRestantes.splice(
        Math.floor(Math.random()*preguntasRestantes.length),1
    )[0];

    pregunta.innerText = preguntaActual.p;

    zona.innerHTML="";
    input.style.display="none";

    // LETRAS
    if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;

            b.onclick=()=>{
                input.value = preguntaActual.p.replace("_",op).replace(/ /g,"").toLowerCase();
            };

            zona.appendChild(b);
        });
    }

    // INPUT
    else if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    // TEST
    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;

            b.onclick=()=>{
                input.value=op;
            };

            zona.appendChild(b);
        });
    }
}


// =======================================
// COMPROBAR (ESTA ES LA CLAVE)
export function comprobar(){

    const r = limpiar(document.getElementById("respuesta").value);
    const ok = limpiar(preguntaActual.r);

    const resultado = document.getElementById("resultado");

    const correcto = r === ok;

    if(correcto){
        resultado.innerText = "✔ Correcto";
    }else{
        resultado.innerText = `✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    animarResultado(resultado, correcto);

    // ✅ ESTO ES LO IMPORTANTE → SIN ERRORES
    if (window.registrarResultado) {
        window.registrarResultado(
            materia + nivel,
            correcto ? 1 : 0,
            correcto ? 0 : 1
        );
    }

    setTimeout(() => iniciarJuego(materia + nivel), 1000);
}


// =======================================
function calc(op,max){
    let a=Math.floor(Math.random()*max);
    let b=Math.floor(Math.random()*max);

    if(op==="+") return {p:`${a}+${b}`,r:(a+b).toString()};
    if(op==="-") return {p:`${a}-${b}`,r:(a-b).toString()};
    return {p:`${a}×${b}`,r:(a*b).toString()};
}
