import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let datos = {};

// ==============================
export async function iniciarFamilia() {
    await cargarDatosFirebase();
    renderFamilia();
}

// ==============================
async function cargarDatosFirebase() {
    try {
        const db = window.db;

        if (!window.uid) {
            console.log("⚠️ No hay usuario logueado");
            datos = {};
            return;
        }

        const ref = doc(db, "usuarios", window.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            datos = snap.data();
            console.log("✅ Datos familia cargados:", datos);
        } else {
            datos = {};
        }

    } catch (e) {
        console.error("Error cargando Firebase:", e);
        datos = {};
    }
}

// ==============================
function obtenerGlobal() {
    return Object.values(datos.puntosPorNivel || {})
        .reduce((a, b) => a + (Number(b) || 0), 0);
}

// ==============================
function limpiarDatos(obj) {
    const limpio = {};

    for (const [k, v] of Object.entries(obj || {})) {
        if (!k || k.trim() === "") continue;
        if (isNaN(v)) continue;
        limpio[k] = Number(v);
    }

    return limpio;
}

// ==============================
function renderFamilia() {
    const cont = document.getElementById("familia");
    if (!cont) return;

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
                            .map(([k,v]) => `<p>${k}: <b>${v}</b></p>`)
                            .join("")
                        : "<p>No hay datos</p>"
                }
            </div>

        </div>
    `;
}
