// =======================================
// PROGRESO ÚNICO Y ESTABLE
// =======================================

// 🔥 GUARDAR
export async function guardarProgreso(datos){

    try {
        localStorage.setItem(
            "progreso",
            JSON.stringify(datos)
        );
    } catch (e) {
        console.warn("Error guardando progreso", e);
    }

    console.log("✅ Progreso guardado");
}

// =======================================
// 🔥 CARGAR
// =======================================
export async function cargarProgreso(){

    try {
        const data = localStorage.getItem("progreso");

        if(!data){
            return {
                aciertos: 0,
                puntosPorNivel: {},
                historial: []
            };
        }

        const parsed = JSON.parse(data);

        return {
            aciertos: 0,
            puntosPorNivel: {},
            historial: [],
            ...parsed
        };

    } catch (e) {
        console.warn("Error cargando progreso", e);

        return {
            aciertos: 0,
            puntosPorNivel: {},
            historial: []
        };
    }
}
