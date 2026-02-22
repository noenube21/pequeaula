let num1 = 0;
let num2 = 0;

let partidas = Number(localStorage.getItem("partidas")) || 0;
let aciertos = Number(localStorage.getItem("aciertos")) || 0;

function generarPregunta() {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;

    document.getElementById("pregunta").textContent =
        `¿Cuánto es ${num1} + ${num2}?`;
}

function comprobarRespuesta() {
    const valor = Number(document.getElementById("respuesta").value);

    partidas++;

    if (valor === num1 + num2) {
        aciertos++;
        document.getElementById("resultadoJuego").textContent = "¡Correcto!";
    } else {
        document.getElementById("resultadoJuego").textContent =
            `Incorrecto. Era ${num1 + num2}`;
    }

    localStorage.setItem("partidas", partidas);
    localStorage.setItem("aciertos", aciertos);

    setTimeout(() => {
        document.getElementById("resultadoJuego").textContent = "";
        generarPregunta();
    }, 1500);
}

window.onload = generarPregunta;
