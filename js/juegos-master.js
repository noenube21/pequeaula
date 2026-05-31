import { getDoc, doc, setDoc }
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db, auth } from "../firebase-config.js";

// =========================
let juegoActual;
let preguntas = [];
let preguntaActual;
let puntos = 0;
let bloqueado = false;

// =========================
export async function cargarFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    const ref = doc(db,"usuarios",user.uid);
    const snap = await getDoc(ref);

    if(snap.exists()){
        puntos = snap.data().puntos || 0;
    }else{
        await setDoc(ref,{ puntos:0 });
        puntos = 0;
    }

    actualizarPuntos();
}

// =========================
async function guardarFirebase(){
    const user = auth.currentUser;
    if(!user) return;

    await setDoc(doc(db,"usuarios",user.uid),
    { puntos },{ merge:true });
}

// =========================
function actualizarPuntos(){
    document.getElementById("score").innerText =
        "Puntos: " + puntos;
}

// =========================
function limpiar(t){
    return t.toLowerCase().trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"");
}

// =========================
function rnd(n){
    return Math.floor(Math.random()*n);
}

// =========================
// DATOS
const ingles = [
["dog","perro"],["cat","gato"],["car","coche"],
["sun","sol"],["moon","luna"],["milk","leche"],
["book","libro"],["water","agua"]
];

// =========================
function generarOpciones(correcta, lista){
    const otras = lista.filter(x=>x!==correcta);
    return [correcta,...otras.sort(()=>Math.random()-0.5).slice(0,2)]
        .sort(()=>Math.random()-0.5);
}

// =========================
function generarMates(){
    let a = rnd(20);
    let b = rnd(20);

    return {
        p: a + " + " + b,
        r: (a+b).toString(),
        tipo: "input"
    };
}

// =========================
const Juegos = {

    matematicas1:{ generar: generarMates },
    matematicas2:{ generar: generarMates },
    matematicas3:{ generar: generarMates },

    ingles1:{
        preguntas: ingles.map(x=>({
            p:x[0]+" =",
            r:x[1],
            tipo:"test",
            opciones: generarOpciones(x[1],ingles.map(y=>y[1]))
        }))
    },

    ingles2:{
        preguntas: ingles.map(x=>({
            p:x[0]+" =",
            r:x[1],
            tipo:"input"
        }))
    },

    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]}
        ]
    },

    ciencias1:{
        preguntas:[
            {p:"Gas respiramos",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","humo"]},
            {p:"Planeta rojo",r:"marte",tipo:"test",opciones:["marte","tierra","venus"]}
        ]
    }
};

// =========================
export function iniciarJuego(key){

    juegoActual = Juegos[key];

    if(!juegoActual){
        document.getElementById("pregunta").innerText = "Error nivel";
        return;
    }

    preguntas = juegoActual.generar
        ? []
        : [...juegoActual.preguntas];

    siguientePregunta();
}

// =========================
function siguientePregunta(){

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const input = document.getElementById("respuesta");
    const btn = document.getElementById("btnComprobar");

    bloqueado = false;
    zona.innerHTML="";
    input.value="";

    // ✅ MATEMÁTICAS
    if(juegoActual.generar){
        preguntaActual = juegoActual.generar();
        pregunta.innerText = preguntaActual.p;

        input.style.display="block";
        btn.style.display="block";
        return;
    }

    // ✅ FIN
    if(!preguntas.length){
        pregunta.innerText="🎉 Nivel terminado";
        input.style.display="none";
        btn.style.display="none";
        zona.innerHTML="";
        return;
    }

    // ✅ NUEVA
    preguntaActual = preguntas.splice(rnd(preguntas.length),1)[0];
    pregunta.innerText = preguntaActual.p;

    // INPUT
    if(preguntaActual.tipo==="input"){
        input.style.display="block";
        btn.style.display="block";
        return;
    }

    input.style.display="none";
    btn.style.display="none";

    // LETRAS
    if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const b=document.createElement("button");
            b.innerText=op;

            b.onclick=()=>{
                input.value = preguntaActual.p
                    .replace("_",op)
                    .replace(/ /g,"");
                comprobar();
            };

            zona.appendChild(b);
        });
        return;
    }

    // TEST
    preguntaActual.opciones.forEach(op=>{
        const b=document.createElement("button");
        b.innerText=op;

        b.onclick=()=>{
            input.value=op;
            comprobar();
        };

        zona.appendChild(b);
    });
}

// =========================
export async function comprobar(){

    if(bloqueado) return;
    bloqueado = true;

    const r = limpiar(document.getElementById("respuesta").value);
    const ok = limpiar(preguntaActual.r);

    const resultado = document.getElementById("resultado");

    if(r === ok){
        puntos += 1;
        resultado.innerText = "✅ Correcto";
    }else{
        resultado.innerText = "❌ " + preguntaActual.r;
    }

    actualizarPuntos();
    await guardarFirebase();

    setTimeout(()=>{
        siguientePregunta();
    },700);
}
``
