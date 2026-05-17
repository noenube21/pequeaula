// =======================================
const materia = window.materia;
const nivel = window.nivel;

// LIMPIAR RESPUESTA
function limpiar(t){
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
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
            {p:"C__sa",r:"casa"},
            {p:"Pe__o",r:"perro"},
            {p:"Ma__o",r:"mango"},
            {p:"Ga__a",r:"gamba"},
            {p:"Pla__o",r:"plato"},
            {p:"He__o",r:"huevo"},
            {p:"Mo__a",r:"moto"},
            {p:"Me__a",r:"mesa"}
        ]
    },

    castellano2:{
        preguntas:[
            {p:"ca__a",r:"cama"},
            {p:"ma__o",r:"mano"},
            {p:"so__a",r:"sopa"},
            {p:"la__o",r:"lago"},
            {p:"bo__a",r:"bola"},
            {p:"fo__o",r:"foco"},
            {
                p:"¿Animal mamífero?",
                r:"perro",
                tipo:"test",
                opciones:["pez","perro","pájaro"]
            }
        ]
    },

    castellano3:{
        preguntas:[
            {p:"¿Verbo? correr/mesa",r:"correr"},
            {p:"¿Sustantivo? gato/saltar",r:"gato"},
            {p:"¿Verbo? comer/plato",r:"comer"},
            {p:"¿Sustantivo? nube/bailar",r:"nube"},
            {
                p:"¿Es un objeto?",
                r:"mesa",
                tipo:"test",
                opciones:["comer","mesa","correr"]
            }
        ]
    },

    // ================= INGLÉS =================
    ingles1:{
        preguntas:[
            {p:"Dog =",r:"perro"},
            {p:"Cat =",r:"gato"},
            {p:"Sun =",r:"sol"},
            {p:"Moon =",r:"luna"},
            {p:"Milk =",r:"leche"},
            {p:"Book =",r:"libro"},
            {p:"Water =",r:"agua"},
            {p:"Car =",r:"coche"}
        ]
    },

    ingles2:{
        preguntas:[
            {
                p:"Dog =",
                r:"perro",
                tipo:"test",
                opciones:["perro","gato","pez"]
            },
            {
                p:"Apple =",
                r:"manzana",
                tipo:"test",
                opciones:["pera","manzana","plátano"]
            },
            {p:"Tree =",r:"árbol"},
            {p:"Chair =",r:"silla"},
            {p:"Fish =",r:"pez"},
            {p:"Window =",r:"ventana"}
        ]
    },

    ingles3:{
        preguntas:[
            {p:"Cold =",r:"frio"},
            {p:"Hot =",r:"caliente"},
            {p:"Food =",r:"comida"},
            {p:"Flower =",r:"flor"},
            {
                p:"Bird =",
                r:"pájaro",
                tipo:"test",
                opciones:["perro","pájaro","pez"]
            }
        ]
    },

    // ================= CIENCIAS =================
    ciencias1:{
        preguntas:[
            {p:"¿Planeta rojo?",r:"marte"},
            {p:"¿Gas que respiramos?",r:"oxigeno"},
            {p:"¿Animal acuático?",r:"pez"},
            {
                p:"¿Necesario para vivir?",
                r:"agua",
                tipo:"test",
                opciones:["agua","metal","plástico"]
            }
        ]
    },

    ciencias2:{
        preguntas:[
            {p:"¿Forma de la Tierra?",r:"redonda"},
            {p:"¿Dónde viven los peces?",r:"agua"},
            {
                p:"¿El sol es?",
                r:"estrella",
                tipo:"test",
                opciones:["planeta","estrella","luna"]
            }
        ]
    },

    ciencias3:{
        preguntas:[
            {p:"¿Órgano para ver?",r:"ojo"},
            {p:"¿Órgano que late?",r:"corazon"},
            {
                p:"¿Qué respiras?",
                r:"oxigeno",
                tipo:"test",
                opciones:["agua","oxígeno","fuego"]
            }
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

        preguntaActual=juegoActual.preguntas[Math.floor(Math.random()*juegoActual.preguntas.length)];
        pregunta.innerText=preguntaActual.p;

        if(preguntaActual.tipo==="test"){
            input.style.display="none";

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

        }else{
            input.style.display="block";
        }

        return;
    }
}


// =======================================
// COMPROBAR
export function comprobar(){

    const valor=document.getElementById("respuesta").value.trim();
    const resultado=document.getElementById("resultado");

    let correcto=false;

    if(juegoActual.generar){
        correcto=(valor===preguntaActual.r);
        resultado.innerText=correcto?"✔ Correcto":`✘ Incorrecto (${preguntaActual.r})`;
    }else{
        const r=limpiar(valor);
        const ok=limpiar(preguntaActual.r);

        correcto=(r===ok);
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
