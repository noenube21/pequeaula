function cargarProgreso() {
    const partidas = parseInt(localStorage.getItem("partidas")) || 0;
    const aciertos = parseInt(localStorage.getItem("aciertos")) || 0;

    const errores = partidas - aciertos >= 0 ? partidas - aciertos : 0;
    const porcentaje = partidas > 0 ? Math.round((aciertos / partidas) * 100) : 0;

    document.getElementById("partidas").innerText = partidas;
    document.getElementById("aciertos").innerText = aciertos;
    document.getElementById("errores").innerText = errores;
    document.getElementById("porcentaje").innerText = porcentaje + "%";
}
