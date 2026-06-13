import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let datos = {};

// =======================================
export async function iniciarFamilia() {
    try {
        const db = window.db;
        const uid = window.uid;

        if (!uid) {
            document.getElementById("familia").innerHTML =
                "<p>⚠️ No hay usuario del juego conectado</p>";
            return;
        }

        const ref = doc(db, "usuarios", uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            document.getElementById("familia").innerHTML =
                "<p>No hay datos del usuario</p>";
            return;
        }

        datos = snap.data();

        renderFamilia();

    } catch (e) {
        console.error(e);
        document.getElementById("familia").innerHTML =
            "<p>Error cargando datos</p>";
    }
}

// =======================================
function obtenerGlobal() {
    return Object.values(datos.puntosPorNivel || {})
        .reduce((a, b) => a + (Number(b) || 0), 0);
}

// =======================================
function limpiarDatos(obj) {
    const limpio = {};

    for (const [k, v] of Object.entries(obj || {})) {
        if (!k || k.trim() === "") continue;
        if (isNaN(v)) continue;
        limpio[k] = Number(v);
    }

    return limpio;
}

// =======================================
function renderGrafico() {
    const canvas = document.getElementById("grafico");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const data = limpiarDatos(datos.puntosPorNivel);

    const keys = Object.keys(data);
    const values = Object.values(data);

    const max = Math.max(...values, 1);

    canvas.width = 700;
    canvas.height = 350;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = 60;
    const gap = 40;

    keys.forEach((nivel, i) => {
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
function renderFamilia() {
    const cont = document.getElementById("familia");

    const data = limpiarDatos(datos.puntosPorNivel);

    cont.innerHTML = `
        <h2>👨‍👩‍👧 Panel Familiar</h2>

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
                            .map(([k, v]) => `<p>${k}: <b>${v}</b></p>`)
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
