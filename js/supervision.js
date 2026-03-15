import { auth, db } from "../firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const d = snap.data();
    if (d.role !== "padre") {
        document.body.innerHTML = "<h2>Acceso solo para padres</h2>";
        return;
    }
    const lista = document.getElementById("hijosUl");
    d.hijos.forEach((id) => {
        const li = document.createElement("li");
        li.textContent = id;
        li.onclick = () => mostrarProgreso(id);
        lista.appendChild(li);
    });
});

async function mostrarProgreso(uid) {
    const ref = doc(db, "usuarios", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const d = snap.data();
    document.getElementById("stats").innerText =
        `Partidas: ${d.partidas || 0}\nAciertos: ${d.aciertos || 0}\nErrores: ${d.errores || 0}\nNivel: ${d.nivel || 1}`;
    let h = "";
    for (let a in d.progreso) {
        const p = d.progreso[a];
        h += `<div><strong>${a}</strong><p>Puntos: ${p.puntos}</p><p>Completado: ${p.completado ? "Sí" : "No"}</p></div>`;
    }
    document.getElementById("asignaturas").innerHTML = h;
}
