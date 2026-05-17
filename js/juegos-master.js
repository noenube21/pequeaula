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
// BASES DE DATOS
const inglesBase = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["tree","árbol"],["chair","silla"],["food","comida"],["fish","pez"],
["flower","flor"],["house","casa"],["door","puerta"],
["window","ventana"],["cold","frio"],["hot","caliente"]
];

// =======================================
// GENERADOR DE OPCIONES
function generarOpciones(correcta, lista){
    const incorrectas = lista.filter(x => x !== correcta);
    const random = incorrectas.sort(() => 0.5 - Math.random()).slice(0,2);
    return [correcta, ...random].sort(() => 0.5 - Math.random());
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
ingos1:{
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
            tipo:"input",
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

    // ================= CASTELLANO =================
    castellano1:{
        preguntas:["casa","mesa","mango","plato","huevo"]
        .map(p=>({
            p:`${p[0]}__${p.slice(2)}`,
            r:p,
            tipo:"test",
            opciones: generarOpciones(p,["casa","mesa","mango","lata"])
        }))
    },

    // ✅ LETRAS NUEVO
    castellano2:{
        preguntas:[
            {p:"M _ S A", r:"mesa", tipo:"letras", opciones:["e","o","i"]},
            {p:"C _ M A", r:"cama", tipo:"letras", opciones:["a","o","e"]},
            {p:"M _ N O", r:"mano", tipo:"letras", opciones:["a","e","i"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"mesa",tipo:"test",opciones:["mesa","leer","correr"]}
        ]
    },

    // ================= CIENCIAS =================
    ciencias1:{
        preguntas:[
            {p:"¿Gas que respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"¿Planeta rojo?",r:"marte",tipo:"test",opciones:["marte","tierra","júpiter"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"¿Forma de la Tierra?",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]},
            {p:"¿Dónde viven los peces?",r:"agua",tipo:"test",opciones:["agua","aire","tierra"]}
        ]
    },

    // ✅ DRAG SIMULADO (PIEZAS)
    ciencias3:{
        ciencias3:{
    preguntas:[
        {
            p:"¿Órgano que late?",
            r:"corazon",
            tipo:"test",
            opciones:["corazón","ojo","mano"]
        },
        {
            p:"¿Órgano para ver?",
            r:"ojo",
            tipo:"test",
            opciones:["ojo","pierna","brazo"]
        },
        {
            p:"¿Qué respiramos?",
            r:"oxigeno",
            tipo:"test",
            opciones:["oxígeno","agua","humo"]
        },
        {
            p:"¿Astro que da luz?",
            r:"sol",
            tipo:"test",
            opciones:["sol","luna","tierra"]
        },
        {
            p:"¿Planeta donde vivimos?",
            r:"tierra",
            tipo:"test",
            opciones:["tierra","marte","saturno"]
        },
        {
            p:"¿Animal del mar?",
            r:"pez",
            tipo:"test",
            opciones:["pez","perro","gato"]
        }
    ]
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

    // ✅ LETRAS
    if(preguntaActual.tipo==="letras"){
        preguntaActual.opciones.forEach(op=>{
            const btn=document.createElement("button");
            btn.innerText=op;
            btn.className="btn";

            btn.onclick=()=>{
                input.value = preguntaActual.p.replace("_",op).replace(/ /g,"").toLowerCase();
            };

            zona.appendChild(btn);
        });
    }

    // ✅ PIEZAS
    else if(preguntaActual.tipo==="piezas"){
        let construccion="";
        preguntaActual.piezas.forEach(p=>{
            const btn=document.createElement("button");
            btn.innerText=p;
            btn.className="btn";

            btn.onclick=()=>{
                construccion += p;
                input.value = construccion;
            };

            zona.appendChild(btn);
        });
    }

    // ✅ TEST
    else{
        preguntaActual.opciones.forEach(op=>{
            const btn=document.createElement("button");
            btn.innerText=op;
            btn.className="btn";

            btn.onclick=()=>{
                input.value=op;
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

    if(correcto){
        resultado.innerText="✔ Correcto";
    }else{
        resultado.innerText=`✘ Incorrecto. Respuesta correcta: ${preguntaActual.r}`;
    }

    import("./progreso.js").then(mod=>{
        mod.registrarResultado(
            materia+nivel,
            correcto?1:0,
            correcto?0:1
        );
    });

    setTimeout(()=>iniciarJuego(materia+nivel),1000);
}
