// =======================================
// JUEGOS DEFINIDOS
// =======================================

const Juegos = {

    matematicas1: {
        generar: () => {
            const a = Math.floor(Math.random()*10);
            const b = Math.floor(Math.random()*10);
            return { p:`${a} + ${b}`, r:(a+b).toString() };
        }
    },

    matematicas2: {
        generar: () => {
            const a = Math.floor(Math.random()*10)+5;
            const b = Math.floor(Math.random()*10);
            return { p:`${a} - ${b}`, r:(a-b).toString() };
        }
    },

    matematicas3: {
        generar: () => {
            const a = Math.floor(Math.random()*10);
            const b = Math.floor(Math.random()*10);
            return { p:`${a} × ${b}`, r:(a*b).toString() };
        }
    },

    castellano1: {
        preguntas: [
            { p:"C__sa", r:"casa" },
            { p:"Pe__o", r:"perro" },
            { p:"Ma__o", r:"mango" }
        ]
    },

    castellano2: {
        preguntas: [
            { p:"Completa: ca__a", r:"cama" },
            { p:"Completa: ma__o", r:"mano" }
        ]
    },

    castellano3: {
        preguntas: [
            { p:"¿Sustantivo? libro / correr", r:"libro" },
            { p:"¿Verbo? saltar / mesa", r:"saltar" }
        ]
    },

    ingles1: {
        preguntas: [
            { p:"Dog =", r:"perro" },
            { p:"House =", r:"casa" }
        ]
    },

    ingles2: {
        preguntas: [
            { p:"Apple =", r:"manzana" },
            { p:"Cat =", r:"gato" }
        ]
    },

    ciencias1: {
        preguntas: [
            { p:"¿Planeta rojo?", r:"marte" },
            { p:"¿Gas que respiramos?", r:"oxigeno" }
        ]
    },

    ciencias2: {
        preguntas: [
            { p:"El sol es una... ¿estrella o planeta?", r:"estrella" },
            { p:"¿Quién produce oxígeno? planta / piedra", r:"planta" }
        ]
    }
};

// =======================================
// MOTOR DEL JUEGO
// =======================================

let juegoActual = null;
let preguntaActual = null;

export function iniciarJuego(key) {

    juegoActual = Juegos[key];

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");
    const resultado = document.getElementById("resultado");
    const input = document.getElementById("respuesta");

    pregunta.innerHTML = "";
    zona.innerHTML = "";
    resultado.innerHTML = "";
    input.value = "";

    // JUEGO DE TEXTO
    if (juegoActual.generar) {
        preguntaActual = juegoActual.generar();
        pregunta.innerText = preguntaActual.p;
        return;
    }

    // JUEGO DE PREGUNTAS
    if (juegoActual.preguntas) {
        preguntaActual =
            juegoActual.preguntas[Math.floor(Math.random()*juegoActual.preguntas.length)];
        pregunta.innerText = preguntaActual.p;
        return;
    }
}

// =======================================
// COMPROBAR RESPUESTA
// =======================================

window.comprobar = function() {
    const r = document.getElementById("respuesta").value.trim().toLowerCase();
    const ok = preguntaActual.r.toLowerCase();

    document.getElementById("resultado").innerText =
        (r === ok) ? "✔ Correcto" : "✘ Incorrecto";
};
