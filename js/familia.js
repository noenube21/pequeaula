import { cargarDatosUsuario } from "./tuArchivoDelJuego.js"; // ajusta nombre real

let datos = null;

// =======================================
// 🔥 CARGAR DATOS DEL USUARIO
export async function iniciarFamilia(){

    await cargarDatosUsuario();

    // aquí asumimos que datos es global accesible o lo exportas
    datos = window.datos; // si no quieres window, te explico alternativa abajo

    renderFamilia();
}

// =======================================
// 🔥 CALCULAR TOTAL GLOBAL
function obtenerGlobal(){

    if(!datos?.puntosPorNivel) return 0;

    return Object.values(datos.puntosPorNivel)
        .reduce((a,b)=>a + (Number(b) || 0), 0);
}

// =======================================
// 📊 RENDER PANEL FAMILIA
function renderFamilia(){

    const cont = document.getElementById("familia");

    if(!cont) return;

    cont.innerHTML = `
        <h2>👨‍👩‍👧 Panel de familia</h2>

        <div class="card">
            <h3>📊 Progreso global</h3>
            <p><b>Total puntos:</b> ${obtenerGlobal()}</p>
            <p><b>Aciertos:</b> ${datos.aciertos}</p>
        </div>

        <div class="card">
            <h3>📚 Por asignatura</h3>
            ${Object.entries(datos.puntosPorNivel || {}).map(([k,v])=>{
                return `<p>${k}: <b>${v}</b></p>`;
            }).join("")}
        </div>
    `;
}
