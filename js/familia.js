import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let datos = {};

// =======================================
// 🔥 ESPERAR UID DE FIREBASE (CLAVE DEL FIX)
function esperarUID() {
    return new Promise((resolve) => {

        if (window.uid) {
            resolve(window.uid);
            return;
        }

        const interval = setInterval(() => {

            if (window.uid) {
                clearInterval(interval);
                resolve(window.uid);
            }

        }, 100);

        // seguridad extra
        setTimeout(() => {
            clearInterval(interval);
            resolve(null);
        }, 5000);
    });
}

// =======================================
export async function iniciarFamilia() {

    await cargarDatos();
    renderFamilia();
}

// =======================================
async function cargarDatos() {

    try {

        const db = window.db;

        const uid = await esperarUID();

        if (!uid) {
            console.log("⚠️ UID no disponible, usando localStorage");
            datos = JSON.parse(localStorage.getItem("progreso")) || {};
            return;
        }

        // 🔥 INTENTO 1: usuarios
        let snap = await getDoc(doc(db, "usuarios", uid));

        // 🔥 INTENTO 2: progreso (backup)
        if (!snap.exists()) {
            snap = await getDoc(doc(db, "progreso", uid));
        }

        if (snap.exists()) {
            datos = snap.data();
            console.log("✅ Datos cargados Firebase:", datos);
        } else {
            console.log("⚠️ No hay datos en Firebase, usando local");
            datos = JSON.parse(localStorage.getItem("progreso")) || {};
        }

    } catch (e) {
        console.error("❌ Error Firebase:", e);
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
                            .map(([k, v]) => `<p>${k}: <b>${v}</b></p>`)
                            .join("")
                        : "<p>No hay datos</p>"
                }
            </div>

        </div>
    `;
}
