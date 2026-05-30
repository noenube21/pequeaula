let puntos = 0;
let preguntaActual = null;
let preguntasRestantes = [];

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
// GENERAR OPERACIONES
function calc(op,max){
    let a=Math.floor(Math.random()*max);
    let b=Math.floor(Math.random()*max);

    if(op==="+") return {p:`${a} + ${b}`,r:(a+b).toString()};
    if(op==="-") return {p:`${a} - ${b}`,r:(a-b).toString()};
    return {p:`${a} x ${b}`,r:(a*b).toString()};
}

// ===============================
// BASE DATOS COMPLETA
const Juegos = {

    // ✅ MATEMÁTICAS DINÁMICAS
    matematicas1:{ generar:()=>calc("+",10) },
    matematicas2:{ generar:()=>calc("-",20) },
    matematicas3:{ generar:()=>calc("*",10) },

    // ✅ INGLÉS
    ingles1:{
        preguntas:[
            {p:"dog =",r:"perro",tipo:"test",opciones:["perro","gato","mesa"]},
            {p:"cat =",r:"gato",tipo:"test",opciones:["gato","perro","casa"]}
        ]
    },

    ingles2:{
        preguntas:[
            {p:"dog =",r:"perro",tipo:"input"},
            {p:"cat =",r:"gato",tipo:"input"}
        ]
    },

    ingles3:{
        preguntas:[
            {p:"perro =",r:"dog",tipo:"test",opciones:["dog","cat","sun"]},
            {p:"gato =",r:"cat",tipo:"test",opciones:["dog","cat","moon"]}
        ]
    },

    // ✅ CASTELLANO
    castellano1:{
        preguntas:[
            {p:"c__a",r:"casa",tipo:"test",opciones:["casa","cama","copa"]},
            {p:"m__a",r:"mesa",tipo:"test",opciones:["mesa","masa","misa"]},
            {p:"p__o",r:"pato",tipo:"test",opciones:["pato","peto","pito"]}
        ]
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa",tipo:"test",opciones:["mesa","leer","correr"]}
        ]
    },

    // ✅ CIENCIAS
    ciencias1:{
        preguntas:[
            {p:"¿Gas que respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"¿Forma de la Tierra?",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"¿Órgano que late?",r:"corazon",tipo:"test",opciones:["corazón","ojo","mano"]}
        ]
    }
};

// ===============================
// INICIAR JUEGO
export function iniciarJuego(key){

    console.log("KEY:", key);

    const juego = Juegos[key];

    if(!juego){
        console.error("NO EXISTE JUEGO:", key);
        document.getElementById("pregunta").innerText="Error cargando nivel";
        return;
    }

    // ✅ MATEMÁTICAS
    if(juego.generar){
        preguntaActual = juego.generar();
        pintarPregunta();
        return;
    }

    preguntasRestantes = [...juego.preguntas];
    siguientePregunta();
}

// ===============================
function siguientePregunta(){

    if(preguntasRestantes.length === 0){
        document.getElementById("pregunta").innerText="Fin 🎉";
        return;
    }

    preguntaActual = preguntasRestantes.pop();
    pintarPregunta();
}

// ===============================
function pintarPregunta(){

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");

    zona.innerHTML="";
    input.value="";

    pregunta.innerText = preguntaActual.p;

    input.style.display="none";

    // INPUT
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
    }

    // LETRAS
    else if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=op;
                marcar(b);
            };

            zona.appendChild(b);
        });
    }

    // TEST
    else{
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;
            b.className="btn opcion";

            b.onclick=()=>{
                input.value=op;
                marcar(b);
            };

            zona.appendChild(b);
        });
    }
}

// ===============================
function marcar(btn){
    document.querySelectorAll(".opcion").forEach(x=>x.classList.remove("seleccionada"));
    btn.classList.add("seleccionada");
}

// ===============================
export function comprobar(){

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
