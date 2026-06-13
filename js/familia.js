import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let datos = {};

// =======================================
// 🔥 INICIO
export async function iniciarFamilia() {
    await cargarDatos();
    renderFamilia();
}

// =======================================
// 🔥 CARGA DE DATOS (FIREBASE + FALLBACK)
async function cargarDatos() {
    try {
        const db = window.db;

        // esperar firebase ready
        await window.firebaseReady;

        const uid = window.uid;

        // =========================
        // 🔥 SI HAY USUARIO -> FIREBASE
        // =========================
        if (uid) {

            let snap = await getDoc(doc(db, "usuarios", uid));

            if (!snap.exists()) {
                snap = await getDoc(doc(db, "progreso", uid));
            }

            if (snap.exists()) {
                datos = snap.data();
                console.log("✅ Datos Firebase cargados:", datos);
                return;
            }
        }

        // =========================
        // 🔥 FALLBACK LOCAL
        // =========================
        console.log("⚠️ Usando localStorage");
        datos = JSON.parse(localStorage.getItem("progreso")) || {};

    } catch (e) {
        console.error("❌ Error cargando familia:", e);
        datos = JSON.parse(localStorage.getItem("progreso")) || {};
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
// 🔥 RENDER PANEL
function renderFamilia() {

    const cont = document.getElementById("familia");
    if (!cont) return;

    const data = limpiarDatos(datos.puntosPorNivel);

    cont.innerHTML = `
        <h2>👨‍👩‍👧 Supervisión Familiar</h2>

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
    `;
}
