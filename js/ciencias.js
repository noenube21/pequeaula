const preguntasCiencias = [
    { pregunta: "¿Qué astro ilumina la Tierra?", respuesta: "sol" },
    { pregunta: "¿Cómo se llama el satélite de la Tierra?", respuesta: "luna" },
    { pregunta: "¿Qué necesitamos para respirar?", respuesta: "aire" },
    { pregunta: "¿Qué animal pone huevos?", respuesta: "gallina" },
    { pregunta: "¿Qué órgano bombea la sangre?", respuesta: "corazón" }
];

let preguntaActualCiencias;

function generarPreguntaCiencias() {
    preguntaActualCiencias = preguntasCiencias[Math.floor(Math.random() * preguntasCiencias.length)];
    document.getElementById("preguntaCiencias").innerText = preguntaActualCiencias.pregunta;
}
function comprobarCiencias() {
    const respuesta = document.getElementById("respuestaCiencias").value.toLowerCase();
    const resultado = document.getElementById("resultadoCiencias");

    // Sumar partida
    let partidas = parseInt(localStorage.getItem("partidas")) || 0;
    localStorage.setItem("partidas", partidas + 1);

    // Comprobar acierto
    if (respuesta === preguntaActualCiencias.respuesta) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";

        let aciertos = parseInt(localStorage.getItem("aciertos")) || 0;
        localStorage.setItem("aciertos", aciertos + 1);

    } else {
        resultado.innerText = "Incorrecto. Era: " + preguntaActualCiencias.respuesta;
        resultado.style.color = "red";
    }

    document.getElementById("respuestaCiencias").value = "";
    generarPreguntaCiencias();
}
