// =======================================
// PROGRESO SIMPLE Y ESTABLE (LOCALSTORAGE)
// =======================================

// 🔥 GUARDAR PROGRESO
export async function guardarProgreso(datos) {
    try {
        localStorage.setItem("progreso", JSON.stringify(datos));
    } catch (e) {
        console.warn("Error guardando progreso", e);
    }
}

// =======================================
// 🔥 CARGAR PROGRESO
// =======================================
export async function cargarProgreso() {
    try {
        const raw = localStorage.getItem("progreso");

        if (!raw) {
            return crearProgresoVacio();
        }

        const data = JSON.parse(raw);

        return {
            ...crearProgresoVacio(),
            ...data
        };

    } catch (e) {
        console.warn("Error cargando progreso", e);
        return crearProgresoVacio();
    }
}

// =======================================
// 🔥 ESTRUCTURA BASE (NO SE ROMPE NUNCA)
// =======================================
function crearProgresoVacio() {
    return {
        aciertos: 0,
        puntosPorNivel: {},
        historial: []
    };
}

// =======================================
// 📊 REGISTRAR RESULTADO (OPCIONAL)
// =======================================
window.registrarResultado = function (asignaturaNivel, acierto, error) {

    let datos = JSON.parse(localStorage.getItem("progreso")) || crearProgresoVacio();

    datos.aciertos += acierto;
    datos.errores = (datos.errores || 0) + error;

    if (!datos.puntosPorNivel[asignaturaNivel]) {
        datos.puntosPorNivel[asignaturaNivel] = 0;
    }

    datos.puntosPorNivel[asignaturaNivel] += acierto;

    localStorage.setItem("progreso", JSON.stringify(datos));
};

// =======================================
// 📊 ESTADÍSTICAS (FAMILIA / PANEL)
// =======================================
function mostrarEstadisticas() {

    const datos = JSON.parse(localStorage.getItem("progreso"));

    if (!datos) return;

    const partidas = datos.partidas || 0;
    const aciertos = datos.aciertos || 0;
    const errores = datos.errores || 0;

    const total = aciertos + errores;
    const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set("partidas", partidas);
    set("aciertos", aciertos);
    set("errores", errores);
    set("porcentaje", porcentaje + "%");
}

// =======================================
// AUTO LOAD
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    mostrarEstadisticas();
});

// =======================================
// RESET
// =======================================
window.resetearProgreso = function () {
    localStorage.removeItem("progreso");
    alert("Progreso reiniciado");
    location.reload();
};
