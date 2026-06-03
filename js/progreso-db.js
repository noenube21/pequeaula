 // =======================================
 // 💾 GUARDAR PROGRESO
 // =======================================

export async function guardarProgreso(datos) {

    localStorage.setItem(
        "progreso",
        JSON.stringify(datos)
    );

    console.log("✅ Progreso guardado");
}


// =======================================
// 📥 CARGAR PROGRESO
// =======================================

export async function cargarProgreso() {

    return JSON.parse(
        localStorage.getItem("progreso")
    );
}


// =======================================
// 📊 REGISTRAR RESULTADO
// =======================================

window.registrarResultado = function (asignaturaNivel, acierto, error) {

    let datos = JSON.parse(localStorage.getItem("progreso")) || {
        partidas: 0,
        aciertos: 0,
        errores: 0,
        puntos: 0,
        niveles: {}
    };

    // Global
    datos.partidas += 1;
    datos.aciertos += acierto;
    datos.errores += error;

    // Por nivel
    if (!datos.niveles[asignaturaNivel]) {
        datos.niveles[asignaturaNivel] = {
            aciertos: 0,
            errores: 0
        };
    }

    datos.niveles[asignaturaNivel].aciertos += acierto;
    datos.niveles[asignaturaNivel].errores += error;

    localStorage.setItem(
        "progreso",
        JSON.stringify(datos)
    );

    console.log("✅ GUARDADO LOCAL:", asignaturaNivel);
};


// =======================================
// 📈 MOSTRAR ESTADÍSTICAS
// =======================================

function mostrarEstadisticas() {

    const datos = JSON.parse(
        localStorage.getItem("progreso")
    );

    if (!datos) return;

    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    const total = aciertos + errores;

    const porcentaje =
        total > 0
            ? Math.round((aciertos / total) * 100)
            : 0;

    const partidasEl = document.getElementById("partidas");
    const aciertosEl = document.getElementById("aciertos");
    const erroresEl = document.getElementById("errores");
    const porcentajeEl = document.getElementById("porcentaje");

    if (partidasEl) partidasEl.textContent = partidas;
    if (aciertosEl) aciertosEl.textContent = aciertos;
    if (erroresEl) erroresEl.textContent = errores;
    if (porcentajeEl) porcentajeEl.textContent = porcentaje + "%";
}


// =======================================
// 🚀 AUTO CARGA ESTADÍSTICAS
// =======================================

document.addEventListener("DOMContentLoaded", () => {
    mostrarEstadisticas();
});


// =======================================
// 🔄 RESETEAR PROGRESO
// =======================================

window.resetearProgreso = function () {

    localStorage.removeItem("progreso");

    alert("Progreso reiniciado");

    location.reload();
};
