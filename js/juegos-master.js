// =======================================
// JUEGOS DEFINIDOS
// =======================================

const Juegos = {

    // ===============================
    // MATEMÁTICAS
    // ===============================

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

    // ===============================
    // CASTELLANO
    // ===============================

    castellano1: {
        preguntas: [
            { p:"C__sa", r:"casa" },
            { p:"Pe__o", r:"perro" },
            { p:"Ma__o", r:"mango" },
            { p:"Ga__a", r:"gamba" },
            { p:"Pla__o", r:"plato" },
            { p:"Ca__ón", r:"cajón" },
            { p:"Pa__e", r:"padre" },
            { p:"He__o", r:"huevo" },
            { p:"Mo__a", r:"moto" },
            { p:"Me__a", r:"mesa" }
        ]
    },

    castellano2: {
        preguntas: [
            { p:"Completa: ca__a", r:"cama" },
            { p:"Completa: ma__o", r:"mano" },
            { p:"Completa: so__a", r:"sopa" },
            { p:"Completa: la__o", r:"lago" },
            { p:"Completa: pa__o", r:"pato" },
            { p:"Completa: bo__a", r:"bola" },
            { p:"Completa: fo__o", r:"foco" },
            { p:"Completa: pa__e", r:"padre" },
            { p:"Completa: ve__o", r:"vaso" },
            { p:"Completa: ti__a", r:"tiza" }
        ]
    },

    castellano3: {
        preguntas: [
            { p:"¿Sustantivo? libro / correr", r:"libro" },
            { p:"¿Verbo? saltar / mesa", r:"saltar" },
            { p:"¿Sustantivo? agua / cantar", r:"agua" },
            { p:"¿Verbo? comer / plato", r:"comer" },
            { p:"¿Sustantivo? gato / correr", r:"gato" },
            { p:"¿Verbo? dormir / lápiz", r:"dormir" },
            { p:"¿Sustantivo? flor / pintar", r:"flor" },
            { p:"¿Verbo? leer / silla", r:"leer" },
            { p:"¿Sustantivo? nube / bailar", r:"nube" },
            { p:"¿Verbo? escribir / casa", r:"escribir" }
        ]
    },

    // ===============================
    // INGLÉS
    // ===============================

    ingles1: {
        preguntas: [
            { p:"Dog =", r:"perro" }, { p:"House =", r:"casa" }, { p:"Car =", r:"coche" },
            { p:"Sun =", r:"sol" },   { p:"Moon =", r:"luna" }, { p:"Milk =", r:"leche" },
            { p:"Book =", r:"libro" }, { p:"Cat =", r:"gato" }, { p:"Water =", r:"agua" },
            { p:"Bed =", r:"cama" }
        ]
    },

    ingles2: {
        preguntas: [
            { p:"Apple =", r:"manzana" }, { p:"Cat =", r:"gato" }, { p:"Orange =", r:"naranja" },
            { p:"Mouse =", r:"ratón" }, { p:"School =", r:"escuela" }, { p:"Tree =", r:"árbol" },
            { p:"Fish =", r:"pez" }, { p:"Chair =", r:"silla" }, { p:"Window =", r:"ventana" },
            { p:"Milk =", r:"leche" }
        ]
    },

    ingles3: {
        preguntas: [
            { p:"Sun =", r:"sol" }, { p:"Water =", r:"agua" }, { p:"Tree =", r:"arbol" },
            { p:"Door =", r:"puerta" }, { p:"Flower =", r:"flor" }, { p:"Bird =", r:"pajaro" },
            { p:"Food =", r:"comida" }, { p:"Happy =", r:"feliz" }, { p:"Cold =", r:"frio" },
            { p:"Hot =", r:"caliente" }
        ]
    },

    // ===============================
    // CIENCIAS
    // ===============================

    ciencias1: {
        preguntas: [
            { p:"¿Planeta rojo?", r:"marte" }, { p:"¿Gas que respiramos?", r:"oxigeno" },
            { p:"¿Animal que pone huevos?", r:"ave" }, { p:"¿Estrella del sistema solar?", r:"sol" },
            { p:"¿Planeta azul?", r:"tierra" }, { p:"¿Ser vivo que hace fotosíntesis?", r:"planta" },
            { p:"¿Animal que vive en el agua?", r:"pez" }, { p:"¿Estación más fría?", r:"invierno" },
            { p:"¿Animal mamífero?", r:"perro" }, { p:"¿Necesario para vivir?", r:"agua" }
        ]
    },

    ciencias2: {
        preguntas: [
            { p:"El sol es una... ¿estrella o planeta?", r:"estrella" },
            { p:"¿Quién produce oxígeno? planta / piedra", r:"planta" },
            { p:"¿Qué planeta es azul?", r:"tierra" },
            { p:"¿Qué animal es mamífero? pez / perro", r:"perro" },
            { p:"¿Con qué respiran los peces?", r:"branquias" },
            { p:"¿Qué astro ilumina la noche?", r:"luna" },
            { p:"¿Qué necesitamos para respirar?", r:"oxigeno" },
            { p:"¿Dónde viven los peces?", r:"agua" },
            { p:"¿Qué es un roble? árbol / ave", r:"arbol" },
            { p:"¿Forma de los planetas?", r:"redonda" }
        ]
    },

    ciencias3: {
        preguntas: [
            { p:"¿Qué órgano bombea la sangre?", r:"corazon" },
            { p:"¿Qué necesitamos para vivir? agua / plastico", r:"agua" },
            { p:"¿Qué astro da luz al planeta?", r:"sol" },
            { p:"¿Qué parte del cuerpo piensa?", r:"cerebro" },
            { p:"¿Qué planeta es el tercero?", r:"tierra" },
            { p:"¿Qué animal pone huevos?", r:"ave" },
            { p:"¿Qué respiramos?", r:"oxigeno" },
            { p:"¿Animal del mar?", r:"pez" },
            { p:"¿Qué hacen las plantas?", r:"fotosintesis" },
            { p:"¿Órgano para ver?", r:"ojo" }
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

    if (juegoActual.generar) {
        preguntaActual = juegoActual.generar();
        pregunta.innerText = preguntaActual.p;
        return;
    }

    if (juegoActual.preguntas) {
        preguntaActual =
            juegoActual.preguntas[Math.floor(Math.random()*juegoActual.preguntas.length)];
        pregunta.innerText = preguntaActual.p;
        return;
    }
}

// =======================================
// COMPROBAR RESPUESTA (VERSIÓN FINAL)
// =======================================

export function comprobar() {

    const r = document.getElementById("respuesta").value.trim().toLowerCase();
    const ok = preguntaActual.r.toLowerCase();
    const resultado = document.getElementById("resultado");

    // Mostrar resultado
    if (r === ok) {
        resultado.innerText = "✔ Correcto";
    } else {
        resultado.innerText = `✘ Incorrecto. La respuesta correcta es: ${preguntaActual.r}`;
    }

    // ⭐ REGISTRAR PROGRESO GLOBAL
    import("./js/progreso.js").then(mod => {
        mod.registrarResultado(
            materia + nivel,       // ejemplo: ingles3
            r === ok ? 1 : 0,      // acierto
            r !== ok ? 1 : 0       // error
        );
    }).catch(err => console.error("Error cargando progreso.js:", err));

    // Siguiente pregunta
    setTimeout(() => iniciarJuego(materia + nivel), 800);
}
