// =======================================
// ACCESO A VARIABLES DEL JUEGO
// =======================================
const materia = window.materia;
const nivel = window.nivel;


// ✅ LIMPIAR TEXTO (acento, mayúsculas, etc.)
function limpiar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// ✅ DISTANCIA LEVENSHTEIN (casi correcto)
function distancia(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}


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
            { p:"C__sa", r:["casa"] },
            { p:"Pe__o", r:["perro"] }
        ]
    },

    ingles1: {
        preguntas: [
            { p:"Dog =", r:["perro"] }
        ]
    },

    ciencias1: {
        preguntas: [
            {
                p:"¿Necesario para vivir?",
                r:["agua"],
                tipo:"test",
                opciones:["agua","plastico","metal"]
            }
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

    document.getElementById("btnComprobar").onclick = comprobar;

    // matemáticas
    if (juegoActual.generar) {
        preguntaActual = juegoActual.generar();
        pregunta.innerText = preguntaActual.p;
        input.style.display = "block";
        return;
    }

    // preguntas normales
    if (juegoActual.preguntas) {

        preguntaActual =
            juegoActual.preguntas[Math.floor(Math.random()*juegoActual.preguntas.length)];

        pregunta.innerText = preguntaActual.p;

        // ✅ tipo test (botones)
        if (preguntaActual.tipo === "test") {

            input.style.display = "none";

            preguntaActual.opciones.forEach(op => {
                const btn = document.createElement("button");
                btn.innerText = op;
                btn.className = "btn";

                btn.onclick = () => {
                    input.value = op;
                    comprobar();
                };

                zona.appendChild(btn);
            });

        } else {
            input.style.display = "block";
        }

        return;
    }
}


// =======================================
// COMPROBAR RESPUESTA MEJORADO
// =======================================
export function comprobar() {

    const r = limpiar(document.getElementById("respuesta").value);
    const resultado = document.getElementById("resultado");

    let respuestas = preguntaActual.r;

    if (!Array.isArray(respuestas)) {
        respuestas = [respuestas];
    }

    const respuestasLimpias = respuestas.map(limpiar);

    let correcto = respuestasLimpias.includes(r);

    if (correcto) {
        resultado.innerText = "✔ Correcto";
    } else {

        // 🔥 detectar "casi"
        let casi = respuestasLimpias.some(resp => distancia(r, resp) <= 2);

        if (casi) {
            resultado.innerText = "⚠️ ¡Casi! revisa la ortografía";
        } else {
            resultado.innerText = `✘ Incorrecto`;
        }
    }

    // ✅ guardar progreso
    import("./progreso.js").then(mod => {
        mod.registrarResultado(
            materia + nivel,
            correcto ? 1 : 0,
            correcto ? 0 : 1
        );
    });

    setTimeout(() => iniciarJuego(materia + nivel), 800);
}
