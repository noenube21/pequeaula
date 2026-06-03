import { cargarDatosUsuario } from "./juegosmaster.js";

let datos = null;

// =======================================
// 🔥 INICIAR PANEL FAMILIA
export async function iniciarFamilia(){

    await cargarDatosUsuario();

    // puente desde el juego principal
    datos = window.datos;

    renderFamilia();
}

// =======================================
// 📊 TOTAL GLOBAL
function obtenerGlobal(){

    if(!datos?.puntosPorNivel) return 0;

    return Object.values(datos.puntosPorNivel)
        .reduce((a,b)=>a + (Number(b) || 0), 0);
}

// =======================================
// 📊 RENDER
function renderFamilia(){

    const cont = document.getElementById("familia");

    if(!cont){
        console.error("No existe el contenedor #familia");
        return;
    }

    cont.innerHTML = `
        <h2>👨‍👩‍👧 Panel de familia</h2>

        <div class="card">
            <h3>📊 Progreso global</h3>
            <p><b>Total puntos:</b> ${obtenerGlobal()}</p>
            <p><b>Aciertos:</b> ${datos?.aciertos || 0}</p>
        </div>

        <div class="card">
            <h3>📚 Por asignatura</h3>
            ${
                Object.entries(datos?.puntosPorNivel || {}).length > 0
                ? Object.entries(datos.puntosPorNivel)
                    .map(([k,v])=>{
                        return `<p>${k}: <b>${v}</b></p>`;
                    }).join("")
                : "<p>No hay datos aún</p>"
            }
        </div>

        <!-- 👇 IMAGEN ABAJO DE TODO -->
        <div style="text-align:center; margin-top:20px;">
            <img 
                src="./imagenes/familia.png" 
                alt="familia"
                style="
                    max-width:260px;
                    width:100%;
                    border-radius:12px;
                    box-shadow:0 4px 12px rgba(0,0,0,0.2);
                "
            >
        </div>
    `;
}
