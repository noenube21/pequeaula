window.onload = () => {
    const partidas = Number(localStorage.getItem("partidas")) || 0;
    const aciertos = Number(localStorage.getItem("aciertos")) || 0;

    document.getElementById("partidasSpan").textContent = partidas;
    document.getElementById("aciertosSpan").textContent = aciertos;

    const porcentaje = partidas > 0 ? Math.round((aciertos / partidas) * 100) : 0;
    document.getElementById("porcentajeSpan").textContent = porcentaje + "%";
};
