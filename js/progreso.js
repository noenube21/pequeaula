// =======================================
// PROGRESO LOCAL 100% FUNCIONAL
// =======================================

export async function guardarProgreso(datos) {
    localStorage.setItem("progreso", JSON.stringify(datos));
}

export async function cargarProgreso() {
    const data = localStorage.getItem("progreso");

    if (!data) {
        return {
            aciertos: 0,
            puntosPorNivel: {},
            historial: []
        };
    }

    return JSON.parse(data);
}

// =======================================
// RESET (opcional)
// =======================================
window.resetearProgreso = function () {
    localStorage.removeItem("progreso");
    location.reload();
};
