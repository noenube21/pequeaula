// =======================================
const materia = window.materia;
const nivel = window.nivel;

function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

let ultimaPregunta = null;


// =======================================
// GENERADOR DE OPCIONES
function opciones(correcta, lista){
    const mezcladas = lista.sort(() => 0.5 - Math.random()).slice(0,2);
    return [correcta, ...mezcladas].sort(() => 0.5 - Math.random());
}


// =======================================
// DATOS BASE GRANDES (para no repetir)
const baseIngles = [
["dog","perro"],["cat","gato"],["sun","sol"],["moon","luna"],
["milk","leche"],["car","coche"],["water","agua"],["book","libro"],
["tree","árbol"],["chair","silla"],["food","comida"],["fish","pez"],
["flower","flor"],["house","casa"],["door","puerta"],
["window","ventana"],["cold","frio"],["hot","caliente"],["happy","feliz"],
["sad","triste"],["big","grande"],["small","pequeño"],
["fast","rápido"],["slow","lento"],["light","luz"],
["dark","oscuro"],["sky","cielo"],["earth","tierra"],
["fire","fuego"],["air","aire"]
];

const baseCiencias = [
["¿Planeta rojo?","marte"],
["¿Gas que respiramos?","oxigeno"],
["¿Animal acuático?","pez"],
["¿Necesario para vivir?","agua"],
["¿Forma de la Tierra?","redonda"],
["¿Órgano para ver?","ojo"],
["¿Órgano que late?","corazon"],
["¿Quién hace fotosíntesis?","planta"],
["¿Luz del día?","sol"],
["¿Animal mamífero?","perro"]
];


// =======================================
// JUEGOS
const Juegos = {

    // ================= MATEMÁTICAS =================
    matematicas1:{
        generar:()=>{
            let a=Math.floor(Math.random()*10);
            let b=Math.floor(Math.random()*10);
            return{p:`${a}+${b}`,r:(a+b).toString()};
        }
    },

    matematicas2:{
        generar:()=>{
            let a=Math.floor(Math.random()*20);
            let b=Math.floor(Math.random()*10);
            return{p:`${a}-${b}`,r:(a-b).toString()};
        }
    },

    matematicas3:{
        generar:()=>{
            let a=Math.floor(Math.random()*10);
            let b=Math.floor(Math.random()*10);
            return{p:`${a}×${b}`,r:(a*b).toString()};
        }
    },

    // ================= INGLÉS =================
    ingles1:{
        preguntas: baseIngles.map(x=>({
            p:x[0]+" =",
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], baseIngles.map(y=>y[1]))
        }))
    },

    ingles2:{
        preguntas: baseIngles.map(x=>({
            p:x[0]+" =",
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], baseIngles.map(y=>y[1]))
        }))
    },

    ingles3:{
        preguntas: baseIngles.map(x=>({
            p:x[0]+" =",
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], baseIngles.map(y=>y[1]))
        }))
    },

    // ================= CIENCIAS =================
    ciencias1:{
        preguntas: baseCiencias.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], baseCiencias.map(y=>y[1]))
        }))
    },

    ciencias2:{
        preguntas: baseCiencias.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], baseCiencias.map(y=>y[1]))
        }))
    },

    ciencias3:{
        preguntas: baseCiencias.map(x=>({
            p:x[0],
            r:x[1],
            tipo:"test",
            opciones: opciones(x[1], baseCiencias.map(y=>y[1]))
        }))
    },

    // ================= CASTELLANO =================
    castellano1:{
        preguntas:[
            "casa","perro","mango","mesa","plato","huevo","moto"
        ].map(pal=>({
            p:`${pal[0]}__${pal.slice(2)}`,
            r:pal,
            tipo:"test",
            opciones: opciones(pal, ["cosa","pato","mesa","coco","pila"])
        }))
    },

    castellano2:{
        preguntas:[
            "cama","mano","sopa","lago","bola","foco"
        ].map(pal=>({
            p:`${pal.slice(0,2)}__${pal.slice(3)}`,
            r:pal,
            tipo:"test",
            opciones: opciones(pal, ["pato","lata","gato","cosa"])
        }))
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo? correr o mesa", r:"correr"},
            {p:"¿Sustantivo? gato o saltar", r:"gato"},
            {p:"¿Verbo? leer o silla", r:"leer"},
            {p:"¿Sustantivo? nube o bailar", r:"nube"}
        ].map(x=>({
            p:x.p,
            r:x.r,
            tipo:"test",
            opciones: opciones(x.r, ["mesa","comer","perro","silla"])
        }))
    }
};


// =======================================
// MOTOR
let juegoActual=null;
let preguntaActual=null;

export function iniciarJuego(key){

    juegoActual=Juegos[key];

    const pregunta=document.getElementById("pregunta");
    const zona=document.getElementById("zona");
    const input=document.getElementById("respuesta");
    const resultado=document.getElementById("resultado");

    pregunta.innerHTML="";
    zona.innerHTML="";
    resultado.innerHTML="";
    input.value="";

    document.getElementById("btnComprobar").onclick=comprobar;

    if(juegoActual.generar){
        preguntaActual=juegoActual.generar();
        pregunta.innerText=preguntaActual.p;
        input.style.display="block";
        return;
    }

    if(juegoActual.preguntas){

        do{
            preguntaActual=juegoActual.preguntas[Math.floor(Math.random()*juegoActual.preguntas.length)];
        }while(preguntaActual===ultimaPregunta);

        ultimaPregunta=preguntaActual;

        pregunta.innerText=preguntaActual.p;

        input.style.display="none";
        zona.innerHTML="";

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

    const valor=document.getElementById("respuesta").value.trim();
    const resultado=document.getElementById("resultado");

    let correcto=false;

    if(juegoActual.generar){
        correcto = valor === preguntaActual.r;
        resultado.innerText=correcto?"✔ Correcto":`✘ Incorrecto (${preguntaActual.r})`;
    }else{
        correcto=limpiar(valor)===limpiar(preguntaActual.r);
        resultado.innerText=correcto?"✔ Correcto":"✘ Incorrecto";
    }

    import("./progreso.js").then(mod=>{
        mod.registrarResultado(
            materia+nivel,
            correcto?1:0,
            correcto?0:1
        );
    });

    setTimeout(()=>iniciarJuego(materia+nivel),800);
}
