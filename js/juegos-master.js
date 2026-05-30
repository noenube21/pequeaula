const materia = "";// ya no se usa
const nivel = "";

let preguntasRestantes = [];
let puntos = 0;
let juegoActual = null;
let preguntaActual = null;

// ===============================
function limpiar(t){
    return t.toLowerCase().trim();
}

// ===============================
function actualizarPuntos(){
    const score = document.getElementById("score");
    if(score){
        score.innerText = "Puntos: " + puntos;
    }
}

// ===============================
// BASE DATOS
const Juegos = {

    castellano1: {
        preguntas: [
            {p:"c__a",r:"casa",tipo:"test",opciones:["casa","cama","copa"]},
            {p:"m__a",r:"mesa",tipo:"test",opciones:["mesa","masa","misa"]},
            {p:"p__o",r:"pato",tipo:"test",opciones:["pato","peto","pito"]},
            {p:"g__o",r:"gato",tipo:"test",opciones:["gato","gota","goma"]}
        ]
    },

    castellano2: {
        preguntas: [
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]}
        ]
    },

    castellano3: {
        preguntas: [
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa",tipo:"test",opciones:["mesa","leer","correr"]}
        ]
    }
};

// ===============================
// INICIAR
export function iniciarJuego(key){

    juegoActual = Juegos[key];

    if(!juegoActual){
        console.error("No existe:", key);
        return;
    }

    preguntasRestantes = [...juegoActual.preguntas];

    siguientePregunta();
}

// ===============================
// SIGUIENTE PREGUNTA
function siguientePregunta(){

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");
    const resultado=document.getElementById("resultado");

    zona.innerHTML="";
    input.value="";
    resultado.innerText="";

    if(preguntasRestantes.length === 0){
        pregunta.innerText="Has terminado 🎉";
        return;
    }

    preguntaActual = preguntasRestantes.pop();

    pregunta.innerText = preguntaActual.p;

    input.style.display="none";

    if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    else if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");

            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=preguntaActual.p.replace("_",op).replace(/ /g,"").toLowerCase();
                seleccionar(b);
            };

            zona.appendChild(b);
        });
    }

    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");

            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=op;
                seleccionar(b);
            };

            zona.appendChild(b);
        });
    }
}

// ===============================
function seleccionar(btn){
    document.querySelectorAll(".opcion").forEach(x=>x.classList.remove("seleccionada"));
    btn.classList.add("seleccionada");
}

// ===============================
export function comprobar(){

    if(!preguntaActual) return;

    const r=limpiar(document.getElementById("respuesta").value);
    const ok=limpiar(preguntaActual.r);
    const resultado=document.getElementById("resultado");

    if(r===ok){
        resultado.innerText="✔ Correcto";
        puntos++;
    }else{
        resultado.innerText="✘ Incorrecto";
    }

    actualizarPuntos();

    setTimeout(()=>siguientePregunta(),1000);
}
