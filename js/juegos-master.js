// =======================================
const materia = window.materia;
const nivel = window.nivel;

let ultimaPregunta = null;

// limpiar texto
function limpiar(t){
    return t.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

// =======================================
// JUEGOS COMPLETOS
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

    // ================= CASTELLANO =================
    castellano1:{
        preguntas:[
            {p:"C__sa",r:"casa",tipo:"test",opciones:["casa","cosa","coco"]},
            {p:"Pe__o",r:"perro",tipo:"test",opciones:["perro","pero","pera"]},
            {p:"Ma__o",r:"mango",tipo:"test",opciones:["mango","mano","mayo"]},
            {p:"Me__a",r:"mesa",tipo:"test",opciones:["mesa","masa","misa"]}
        ]
    },

    castellano2:{
        preguntas:[
            {p:"ca__a",r:"cama",tipo:"test",opciones:["cama","casa","cava"]},
            {p:"ma__o",r:"mano",tipo:"test",opciones:["mano","malo","mago"]},
            {p:"la__o",r:"lago",tipo:"test",opciones:["lago","lado","loco"]},
            {p:"so__a",r:"sopa",tipo:"test",opciones:["sopa","suma","soda"]}
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo?",r:"correr",tipo:"test",opciones:["correr","mesa","perro"]},
            {p:"¿Sustantivo?",r:"gato",tipo:"test",opciones:["gato","correr","leer"]},
            {p:"¿Verbo?",r:"comer",tipo:"test",opciones:["comer","puerta","silla"]},
            {p:"¿Sustantivo?",r:"mesa",tipo:"test",opciones:["mesa","correr","comer"]}
        ]
    },

    // ================= INGLÉS =================
    ingles1:{
        preguntas:[
            {p:"Dog =",r:"perro",tipo:"test",opciones:["perro","gato","pez"]},
            {p:"Cat =",r:"gato",tipo:"test",opciones:["gato","perro","pez"]},
            {p:"Sun =",r:"sol",tipo:"test",opciones:["sol","luna","cielo"]},
            {p:"Book =",r:"libro",tipo:"test",opciones:["libro","mesa","puerta"]}
        ]
    },

    ingles2:{
        preguntas:[
            {p:"Apple =",r:"manzana",tipo:"test",opciones:["manzana","pera","plátano"]},
            {p:"Milk =",r:"leche",tipo:"test",opciones:["leche","agua","zumo"]},
            {p:"Chair =",r:"silla",tipo:"test",opciones:["silla","mesa","puerta"]},
            {p:"Tree =",r:"árbol",tipo:"test",opciones:["árbol","flor","hierba"]}
        ]
    },

    // 🔥 NIVEL INVERTIDO
    ingles3:{
        preguntas:[
            {p:"perro =",r:"dog",tipo:"test",opciones:["dog","cat","fish"]},
            {p:"gato =",r:"cat",tipo:"test",opciones:["cat","dog","bird"]},
            {p:"agua =",r:"water",tipo:"test",opciones:["water","milk","juice"]},
            {p:"libro =",r:"book",tipo:"test",opciones:["book","table","chair"]}
        ]
    },

    // ================= CIENCIAS =================
    ciencias1:{
        preguntas:[
            {p:"¿Planeta rojo?",r:"marte",tipo:"test",opciones:["marte","tierra","venus"]},
            {p:"¿Gas que respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"¿Animal acuático?",r:"pez",tipo:"test",opciones:["pez","perro","gato"]},
            {p:"¿Necesario para vivir?",r:"agua",tipo:"test",opciones:["agua","plástico","metal"]}
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"¿Forma de la Tierra?",r:"redonda",tipo:"test",opciones:["redonda","plana","cuadrada"]},
            {p:"¿Dónde viven los peces?",r:"agua",tipo:"test",opciones:["agua","aire","tierra"]},
            {p:"¿El sol es?",r:"estrella",tipo:"test",opciones:["estrella","planeta","luna"]},
            {p:"¿Animal mamífero?",r:"perro",tipo:"test",opciones:["perro","pez","águila"]}
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"¿Órgano para ver?",r:"ojo",tipo:"test",opciones:["ojo","brazo","pierna"]},
            {p:"¿Órgano que late?",r:"corazon",tipo:"test",opciones:["corazón","mano","pie"]},
            {p:"¿Qué respiramos?",r:"oxigeno",tipo:"test",opciones:["oxígeno","agua","fuego"]},
            {p:"¿Animal del mar?",r:"pez",tipo:"test",opciones:["pez","perro","gato"]},
            {p:"¿Qué hacen las plantas?",r:"fotosintesis",tipo:"test",opciones:["fotosíntesis","correr","hablar"]},
            {p:"¿Planeta donde vivimos?",r:"tierra",tipo:"test",opciones:["tierra","marte","saturno"]}
        ]
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
``
