import { cargarDatosUsuario } from "./juegos-master.js";

let datos = {};

// =======================================
export async function iniciarFamilia(){

    try {
        await cargarDatosUsuario();
    } catch (e) {
        console.warn("Error cargando usuario:", e);
    }

    // 🔥 fallback seguro
    datos = JSON.parse(localStorage.getItem("progreso")) || {
        aciertos: 0,
        puntosPorNivel: {}
    };

    renderFamilia();
}

// =======================================
function obtenerGlobal(){
    return Object.values(datos.puntosPorNivel || {})
        .reduce((a,b)=>a + (Number(b) || 0), 0);
}

// =======================================
function renderFamilia(){

    const cont = document.getElementById("familia");

    if(!cont){
        console.error("❌ No existe #familia en el HTML");
        return;
    }

    console.log("📊 datos cargados:", datos);

    cont.innerHTML = `
        <div class="card">
            <h2>👨‍👩‍👧 Panel familiar</h2>
        </div>

        <div class="card">
            <h3>📊 Progreso global</h3>
            <p><b>Total puntos:</b> ${obtenerGlobal()}</p>
            <p><b>Aciertos:</b> ${datos.aciertos || 0}</p>
        </div>

        <div class="card">
            <h3>📚 Por asignatura</h3>
            ${Object.entries(datos.puntosPorNivel || {})
                .map(([k,v]) => `<p>${k}: <b>${v}</b></p>`)
                .join("") || "<p>No hay datos aún</p>"}
        </div>
    `;
}
