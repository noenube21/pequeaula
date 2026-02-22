const palabrasCast = [
    { pregunta: "C__sa", respuesta: "casa" },
    { pregunta: "Pe__o", respuesta: "perro" },
    { pregunta: "Ma__o", respuesta: "mango" },
    { pregunta: "Li__o", respuesta: "libro" },
    { pregunta: "Pa__el", respuesta: "papel" }
];

let palabraActualCast;

function generarPreguntaCastellano() {
    palabraActualCast = palabrasCast[Math.floor(Math.random() * palabrasCast.length)];
    document.getElementById("preguntaCast").innerText =
        "Completa la palabra: " + palabraActualCast.pregunta;
}
function comprobarCastellano() {
    const respuesta = document.getElementById("respuestaCast").value.toLowerCase();
    const resultado = document.getElementById("resultadoCast");

    // Sumar partida
    let partidas = parseInt(localStorage.getItem("partidas")) || 0;
    localStorage.setItem("partidas", partidas + 1);

    // Comprobar acierto
    if (respuesta === palabraActualCast.respuesta) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";

        let aciertos = parseInt(localStorage.getItem("aciertos")) || 0;
        localStorage.setItem("aciertos", aciertos + 1);

    } else {
        resultado.innerText = "Incorrecto. Era: " + palabraActualCast.respuesta;
        resultado.style.color = "red";
    }

    document.getElementById("respuestaCast").value = "";
    generarPreguntaCastellano();
}


