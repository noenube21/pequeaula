let num1, num2;

function generarPregunta() {
    num1 = Math.floor(Math.random() * 10);
    num2 = Math.floor(Math.random() * 10);

    document.getElementById("pregunta").innerText = `¿Cuánto es ${num1} + ${num2}?`;
}

function comprobar() {
    const respuesta = parseInt(document.getElementById("respuesta").value);
    const resultado = document.getElementById("resultado");

    // 1) Siempre sumamos una partida
    let partidas = parseInt(localStorage.getItem("partidas")) || 0;
    localStorage.setItem("partidas", partidas + 1);

    // 2) Comprobamos si acierta
    if (respuesta === num1 + num2) {
        resultado.innerText = "¡Correcto!";
        resultado.style.color = "green";

        let aciertos = parseInt(localStorage.getItem("aciertos")) || 0;
        localStorage.setItem("aciertos", aciertos + 1);

    } else {
        resultado.innerText = `Incorrecto. Era ${num1 + num2}`;
        resultado.style.color = "red";
    }

    document.getElementById("respuesta").value = "";
    generarPregunta();
}
