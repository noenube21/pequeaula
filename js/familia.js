import { cargarDatosUsuario } from "./juegosmaster.js";

let datos = null;

// =======================================
export async function iniciarFamilia(){

    await cargarDatosUsuario();

    // 🔥 AHORA LEER DIRECTO DE LOCALSTORAGE (más seguro)
    datos = JSON.parse(localStorage.getItem("progreso")) || {};

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
        console.warn("No existe #familia en HTML");
        return;
    }

    cont.innerHTML = `
        <h2>👨‍👩‍👧 Panel familiar</h2>

        <div class="card">
            <h3>📊 Progreso global</h3>
            <p><b>Total puntos:</b> ${obtenerGlobal()}</p>
            <p><b>Aciertos:</b> ${datos.aciertos || 0}</p>
        </div>

        <div class="card">
            <h3>📚 Por asignatura</h3>
            ${Object.entries(datos.puntosPorNivel || {})
                .map(([k,v]) => `<p>${k}: <b>${v}</b></p>`)
                .join("")}
        </div>
    `;
}
