// =======================================
const materia = window.materia;
const nivel = window.nivel;

// =======================================
// LIMPIAR TEXTO
function limpiar(texto) {
    return texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// =======================================
// DISTANCIA (casi)
function distancia(a, b) {
    if (!a || !b) return 99;
    let d = Math.abs(a.length - b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) d++;
    }
    return d;
}

// =======================================
// JUEGOS
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

    castellano2: {
        preguntas: [
            { p:"Completa: ca__a", r:"cama", tipo:"test",
              opciones:["cama","cana","casa"] },

            { p:"Completa: ma__o", r:"mano", tipo:"test",
              opciones:["mano","malo","masa"] }
        ]
    },

    ingles2: {
        preguntas: [
            { p:"Dog =", r:"perro", tipo:"test",
              opciones:["perro","gato","pez"] },

            { p:"Apple =", r:"manzana", tipo:"test",
              opciones:["manzana","pera","plátano"] }
        ]
    },

    ciencias2: {
        preguntas: [
            { p:"¿Necesario para vivir?", r:"agua", tipo:"test",
              opciones:["agua","plástico","metal"] },

            { p:"¿El sol es?", r:"estrella", tipo:"test",
              opciones:["estrella","planeta","satélite"] }
        ]
    }
};


// =======================================
// MOTOR
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

        if (preguntaActual.tipo === "test") {

            input.style.display = "none";
            zona.innerHTML = "";

            preguntaActual.opciones.forEach(op => {

                const btn = document.createElement("button");

                btn.innerText = op;
                btn.className = "btn";

                btn.style.display = "block";
                btn.style.margin = "10px auto";
                btn.style.padding = "10px";
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
// COMPROBAR
export function comprobar() {

    const valor = document.getElementById("respuesta").value.trim();
    const resultado = document.getElementById("resultado");

    let correcto = false;

    // 🔢 MATEMÁTICAS
    if (juegoActual.generar) {

        correcto = (valor === preguntaActual.r);

        resultado.innerText = correcto
            ? "✔ Correcto"
            : `✘ Incorrecto (${preguntaActual.r})`;
    }

    else {

        const r = limpiar(valor);
        const ok = limpiar(preguntaActual.r);

        correcto = (r === ok);

        if (correcto) {
            resultado.innerText = "✔ Correcto";
        } else {

            const casi = distancia(r, ok) <= 2;

            resultado.innerText = casi
                ? "⚠️ ¡Casi!"
                : "✘ Incorrecto";
        }
    }

    // guardar progreso
    import("./progreso.js").then(mod => {
        mod.registrarResultado(
            materia + nivel,
            correcto ? 1 : 0,
            correcto ? 0 : 1
        );
    });

    setTimeout(() => iniciarJuego(materia + nivel), 1000);
}
