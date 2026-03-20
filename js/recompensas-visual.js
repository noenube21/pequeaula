import { auth, db } from "../firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

auth.onAuthStateChanged(async (u) => {
    if (!u) return;

    const ref = doc(db, "usuarios", u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const datos = snap.data();
    const cont = document.getElementById("contenedorRecompensas");

    const lista = {
        moneda: {
            icono: "💰",
            nombre: "Moneda especial",
            motivo: "Obtenida al superar el 30% de aciertos."
        },
        estrella: {
            icono: "⭐",
            nombre: "Estrella",
            motivo: "Obtenida al superar el 50% de aciertos."
        },
        medalla: {
            icono: "🥇",
            nombre: "Medalla",
            motivo: "Obtenida al superar el 70% de aciertos."
        },
        trofeo: {
            icono: "🏆",
            nombre: "Trofeo",
            motivo: "Obtenida al superar el 90% de aciertos."
        }
    };

    cont.innerHTML = "";

    if (!datos.recompensas) return;

    for (const clave in datos.recompensas) {
        if (datos.recompensas[clave]) {

            const r = lista[clave];

            // ✔ Crear tarjeta bonita
            const card = document.createElement("div");
            card.className = "card";
            card.style.fontSize = "20px";
            card.style.padding = "20px";
            card.style.textAlign = "center";

            card.innerHTML = `
                <div style="font-size:50px;">${r.icono}</div>
                <p><strong>${r.nombre}</strong></p>
                <p style="font-size:14px; color:#444;">${r.motivo}</p>
            `;

            cont.appendChild(card);
        }
    }
});
