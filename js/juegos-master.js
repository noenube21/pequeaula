// =======================================
// VARIABLES
const materia = window.materia;
const nivel = window.nivel;

let preguntasRestantes = [];
let puntos = 0;
let juegoActual = null;
let preguntaActual = null;

// =======================================
// LIMPIAR TEXTO
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
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
// BASE INGLES
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],
["moon","luna"],["milk","leche"],["car","coche"],
["water","agua"],["book","libro"]
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
    },

    castellano1:{
        preguntas:[
            {p:"c__a",r:"casa",tipo:"test",opciones:["casa","cama","copa"]},
            {p:"m__a",r:"mesa",tipo:"test",opciones:["mesa","masa","misa"]},
            {p:"p__o",r:"pato",tipo:"test",opciones:["pato","peto","pito"]}
        ]
    }

};

// =======================================
// INICIAR
export function iniciarJuego(key){

    juegoActual = Juegos[key];

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    pregunta.innerHTML="";
    zona.innerHTML="";
    input.value="";

    input.focus();

    // matemáticas
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

    input.style.display="none";

    // tipo input
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    // tipo test
    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=op;

                document.querySelectorAll(".opcion")
                    .forEach(x=>x.classList.remove("seleccionada"));

                b.classList.add("seleccionada");
            };

            zona.appendChild(b);
        });
    }
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

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    const correcto = r===ok;

    if(correcto){
        resultado.innerText="✔ Correcto";
        puntos++;
    }else{
        resultado.innerText="✘ Incorrecto";
    }

    animarResultado(resultado, correcto);
    actualizarPuntos();

    setTimeout(()=>iniciarJuego(materia+nivel),1000);
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
