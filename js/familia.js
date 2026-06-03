import { cargarDatosUsuario } from "./js/juegos-master.js";

let datos = {};

// =======================================
export async function iniciarFamilia(){

    await cargarDatosUsuario();

    datos = JSON.parse(localStorage.getItem("progreso")) || {};

    renderFamilia();
}

// =======================================
function obtenerGlobal(){
    return Object.values(datos.puntosPorNivel || {})
        .reduce((a,b)=>a + (Number(b) || 0), 0);
}

// =======================================
function renderGrafico(){

    const canvas = document.getElementById("grafico");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    const niveles = Object.keys(datos.puntosPorNivel || {});
    const valores = Object.values(datos.puntosPorNivel || {});

    const max = Math.max(...valores, 1);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const barWidth = 50;
    const gap = 30;

    niveles.forEach((nivel, i)=>{

        const x = i * (barWidth + gap) + 40;
        const h = (valores[i] / max) * 200;

        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(x, 250 - h, barWidth, h);

        ctx.fillStyle = "#000";
        ctx.fillText(nivel, x, 270);
        ctx.fillText(valores[i], x, 240 - h);
    });
}

// =======================================
function renderFamilia(){

    const cont = document.getElementById("familia");

    if(!cont) return;

    cont.innerHTML = `
        <h2>👨‍👩‍👧 Panel Familiar</h2>

        <div class="panel-grid">

            <div class="card">
                <h3>📊 Global</h3>
                <p><b>Total puntos:</b> ${obtenerGlobal()}</p>
                <p><b>Aciertos:</b> ${datos.aciertos || 0}</p>
            </div>

            <div class="card">
                <h3>📚 Por asignatura</h3>
                ${Object.entries(datos.puntosPorNivel || {})
                    .map(([k,v])=>`<p>${k}: <b>${v}</b></p>`)
                    .join("") || "<p>No hay datos</p>"}
            </div>

        </div>

        <div class="card">
            <h3>📈 Progreso</h3>
            <canvas id="grafico" width="600" height="300"></canvas>
        </div>
    `;

    renderGrafico();
}
