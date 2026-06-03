// =======================================
// GUARDAR RESULTADOS
// =======================================
window.registrarResultado = function (asignaturaNivel, acierto, error) {

    // cargar datos
    let datos = JSON.parse(localStorage.getItem("progreso")) || {
        partidas: 0,
        aciertos: 0,
        errores: 0,
        niveles: {}
    };

    // GLOBAL
    datos.partidas += 1;
    datos.aciertos += acierto;
    datos.errores += error;

    // POR NIVEL
    if (!datos.niveles[asignaturaNivel]) {
        datos.niveles[asignaturaNivel] = {
            aciertos: 0,
            errores: 0
        };
    }

    datos.niveles[asignaturaNivel].aciertos += acierto;
    datos.niveles[asignaturaNivel].errores += error;

    // guardar
    localStorage.setItem("progreso", JSON.stringify(datos));

    console.log("✅ GUARDADO LOCAL:", asignaturaNivel);
};


// =======================================
// CARGAR PROGRESO
// =======================================
function cargarProgreso() {

    let datos = JSON.parse(localStorage.getItem("progreso"));

    if (!datos) return;

    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    const total = aciertos + errores;
    const porcentaje = total ? Math.round(aciertos / total * 100) : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";
}

cargarProgreso();


// =======================================
// RESET
// =======================================
window.resetearProgreso = function () {

    localStorage.removeItem("progreso");

    alert("Progreso reiniciado");
    location.reload();
};
