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
        moneda: "💰 Moneda",
        estrella: "⭐ Estrella",
        medalla: "🥇 Medalla",
        trofeo: "🏆 Trofeo"
    };

    cont.innerHTML = "";

    if (!datos.recompensas) return;

    for (const r in datos.recompensas) {
        if (datos.recompensas[r]) {
            const div = document.createElement("div");
            div.className = "card";
            div.style.fontSize = "40px";
            div.innerText = lista[r];
            cont.appendChild(div);
        }
    }
});
