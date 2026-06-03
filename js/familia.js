import { cargarDatosUsuario } from "./juegosmaster.js";

let datos = null;

// =======================================
export async function iniciarFamilia(){

    await cargarDatosUsuario();

    datos = window.datos;

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

    if(!cont) return;

    const historial = (datos.historial || [])
        .slice(-10)
        .reverse()
        .map(h=>`<li>✔ Nivel: ${h.nivel}</li>`)
        .join("");

    cont.innerHTML = `
        <div class="panel-familia">

            <h2>👨‍👩‍👧 Panel Familiar</h2>

            <div class="card">
                <h3>📊 Progreso global</h3>
                <p><b>Total puntos:</b> ${obtenerGlobal()}</p>
                <p><b>Aciertos totales:</b> ${datos.aciertos}</p>
            </div>

            <div class="card">
                <h3>📚 Por asignatura</h3>
                ${Object.entries(datos.puntosPorNivel || {})
                    .map(([k,v])=>{
                        return `<p>${k}: <b>${v}</b></p>`;
                    }).join("")}
            </div>

            <div class="card">
                <h3>📈 Últimos movimientos</h3>
                <ul>${historial}</ul>
            </div>

        </div>
    `;
}
