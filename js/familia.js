import { cargarDatosUsuario } from "./juegos-master.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

let datos = {};

// =======================================
// 🚀 INICIAR PANEL FAMILIA
export async function iniciarFamilia(){

    await cargarDatosUsuario();

    const local = JSON.parse(localStorage.getItem("progreso")) || {};

    datos = {
        ...datos,
        ...local
    };

    renderFamilia();
}

// =======================================
// 📊 GLOBAL
function obtenerGlobal(){
    return Object.values(datos.puntosPorNivel || {})
        .reduce((a,b)=>a + (Number(b) || 0), 0);
}

// =======================================
// 🧹 LIMPIAR DATOS
function limpiarDatos(obj){

    const limpio = {};

    for(const [k,v] of Object.entries(obj || {})){

        if(!k || k.trim() === "") continue;
        if(isNaN(v)) continue;

        limpio[k] = Number(v);
    }

    return limpio;
}

// =======================================
// 📈 GRÁFICO
function renderGrafico(){

    const canvas = document.getElementById("grafico");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    const data = limpiarDatos(datos.puntosPorNivel);

    const keys = Object.keys(data);
    const values = Object.values(data);

    const max = Math.max(...values, 1);

    canvas.width = 700;
    canvas.height = 350;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const barWidth = 60;
    const gap = 40;

    keys.forEach((nivel, i)=>{

        const x = 60 + i * (barWidth + gap);
        const h = (values[i] / max) * 250;

        ctx.fillStyle = "#4fc3f7";
        ctx.fillRect(x, 300 - h, barWidth, h);

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText(nivel, x, 320);
        ctx.fillText(values[i], x + 20, 290 - h);
    });
}

// =======================================
// 🖥️ RENDER PANEL
function renderFamilia(){

    const cont = document.getElementById("familia");

    if(!cont) return;

    const data = limpiarDatos(datos.puntosPorNivel);

    cont.innerHTML = `
        <h2>👨‍👩‍👧 Panel Familiar</h2>

        <button onclick="exportarExcel()" style="margin-bottom:10px;">
            📥 Exportar a Excel
        </button>

        <div class="panel-grid">

            <div class="panel-card">
                <h3>📊 Global</h3>
                <p><b>Total puntos:</b> ${obtenerGlobal()}</p>
                <p><b>Aciertos:</b> ${datos.aciertos || 0}</p>
            </div>

            <div class="panel-card">
                <h3>📚 Por asignatura</h3>
                ${
                    Object.keys(data).length
                    ? Object.entries(data)
                        .map(([k,v])=>`<p>${k}: <b>${v}</b></p>`)
                        .join("")
                    : "<p>No hay datos</p>"
                }
            </div>

        </div>

        <div class="panel-card">
            <h3>📈 Progreso</h3>
            <canvas id="grafico"></canvas>
        </div>
    `;

    setTimeout(renderGrafico, 50);
}

// =======================================
// 📥 EXPORTAR EXCEL
function exportarExcel(){

    const data = limpiarDatos(datos.puntosPorNivel);

    const filas = Object.entries(data).map(([nivel, puntos]) => ({
        nivel,
        puntos
    }));

    filas.push({
        nivel: "TOTAL",
        puntos: obtenerGlobal()
    });

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Progreso");

    XLSX.writeFile(libro, "progreso_usuario.xlsx");
}

window.exportarExcel = exportarExcel;
