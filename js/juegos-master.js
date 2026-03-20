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

    ingles3: {
        preguntas: [
            { p:"Sun =", r:"sol" },
            { p:"Water =", r:"agua" },
            { p:"Tree =", r:"arbol" }
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
    },

    ciencias3: {
        preguntas: [
            { p:"¿Qué órgano bombea la sangre?", r:"corazon" },
            { p:"¿Qué necesitamos para vivir? agua / plastico", r:"agua" },
            { p:"¿Qué astro da luz al planeta?", r:"sol" }
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
// COMPROBAR RESPUESTA — SOLO CAMBIADO LO NECESARIO
// =======================================

export function comprobar() {

    const r = document.getElementById("respuesta").value.trim().toLowerCase();
    const ok = preguntaActual.r.toLowerCase();
    const resultado = document.getElementById("resultado");

    resultado.innerText = (r === ok) ? "✔ Correcto" : "✘ Incorrecto";

    // ⭐ REGISTRO EN PROGRESO (si existe progreso.js)
    import("./progreso.js").then(mod => {
        mod.registrarResultado(
            materia,               // viene de juego.html
            r === ok ? 1 : 0,      // acierto
            r !== ok ? 1 : 0       // error
        );
    }).catch(()=>{});

    // ⭐ HACER SIGUIENTE PREGUNTA AUTOMÁTICA
    setTimeout(() => iniciarJuego(materia + nivel), 800);
}
