// =======================================
// ACCESO A VARIABLES DEL JUEGO
// =======================================
const materia = window.materia;
const nivel = window.nivel;


// =======================================
// UTILIDADES
// =======================================
function limpiar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

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
// JUEGOS DEFINIDOS (NO TOCO LOS TUYOS)
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

    // 🔥 SOLO AÑADIMOS UNA PREGUNTA DE TIPO TEST (NO ROMPE NADA)
    ciencias1: {
        preguntas: [
            {
                p:"¿Necesario para vivir?",
                r:"agua",
                tipo:"test",
                opciones:["agua","plástico","metal"]
            },
            { p:"¿Planeta rojo?", r:"marte" },
            { p:"¿Gas que respiramos?", r:"oxigeno" }
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
    const input = document.getElementById("respuesta");
    const resultado = document.getElementById("resultado");

    pregunta.innerHTML = "";
    zona.innerHTML = "";
    resultado.innerHTML = "";
    input.value = "";

    document.getElementById("btnComprobar").onclick = comprobar;

    // 🔢 MATEMÁTICAS
    if (juegoActual.generar) {
        preguntaActual = juegoActual.generar();
        pregunta.innerText = preguntaActual.p;
        input.style.display = "block";
        return;
    }

    // 📚 RESTO
    if (juegoActual.preguntas) {

        preguntaActual =
            juegoActual.preguntas[Math.floor(Math.random()*juegoActual.preguntas.length)];

        pregunta.innerText = preguntaActual.p;

        // ✅ TEST (botones bien separados)
        if (preguntaActual.tipo === "test") {

            input.style.display = "none";
            zona.innerHTML = "";

            preguntaActual.opciones.forEach(op => {

                const btn = document.createElement("button");
                btn.innerText = op;
                btn.className = "btn";

                // 🎯 MEJOR SEPARACIÓN VISUAL
                btn.style.display = "block";
                btn.style.margin = "10px auto";
                btn.style.width = "200px";

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
// COMPROBAR RESPUESTA
// =======================================

export function comprobar() {

    const valor = document.getElementById("respuesta").value.trim();
    const resultado = document.getElementById("resultado");

    let correcto = false;

    // 🔢 MATEMÁTICAS → SOLO EXACTO
    if (juegoActual.generar) {

        const r = valor;
        const ok = preguntaActual.r;

        correcto = (r === ok);

        if (correcto) {
            resultado.innerText = "✔ Correcto";
        } else {
            resultado.innerText = `✘ Incorrecto (${ok})`;
        }
    }

    // 📚 TEXTO
    else {

        const r = limpiar(valor);
        const ok = limpiar(preguntaActual.r);

        correcto = (r === ok);

        if (correcto) {
            resultado.innerText = "✔ Correcto";
        } else {

            const casi = distancia(r, ok) <= 2;

            if (casi) {
                resultado.innerText = "⚠️ ¡Casi! revisa la ortografía";
            } else {
                resultado.innerText = "✘ Incorrecto";
            }
        }
    }

    // ✅ GUARDAR PROGRESO
    import("./progreso.js").then(mod => {
        mod.registrarResultado(
            materia + nivel,
            correcto ? 1 : 0,
            correcto ? 0 : 1
        );
    });

    setTimeout(() => iniciarJuego(materia + nivel), 1000);
}
``
