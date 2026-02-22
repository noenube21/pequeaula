const vocabularioIng = [
    { pregunta: "Cat", respuesta: "gato" },
    { pregunta: "Dog", respuesta: "perro" },
    { pregunta: "House", respuesta: "casa" },
    { pregunta: "Sun", respuesta: "sol" },
    { pregunta: "Water", respuesta: "agua" }
];

let palabraActualIng;

function generarPreguntaIngles() {
    palabraActualIng = vocabularioIng[Math.floor(Math.random() * vocabularioIng.length)];
    document.getElementById("preguntaIng").innerText =
        "Traduce al español: " + palabraActualIng.pregunta;
}

function comprobarIngles() {
    const respuesta = document.getElementById("respuestaIng").value.toLowerCase();
    const resultado = document.getElementById("resultadoIng");

    // Sumar partida
    let partidas = parseInt(localStorage.getItem("partidas")) || 0;
    localStorage.setItem("partidas", partidas + 1);

    // Comprobar acierto
    if (respuesta === palabraActualIng.respuesta) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";

        let aciertos = parseInt(localStorage.getItem("aciertos")) || 0;
        localStorage.setItem("aciertos", aciertos + 1);

    } else {
        resultado.innerText = "Incorrecto. Era: " + palabraActualIng.respuesta;
        resultado.style.color = "red";
    }

    document.getElementById("respuestaIng").value = "";
    generarPreguntaIngles();
}
