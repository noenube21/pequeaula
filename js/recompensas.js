import { db } from "../firebase-config.js";
import { auth } from "../firebase-config.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function comprobarRecompensas(aciertosTotales) {
    const u = auth.currentUser;
    if (!u) return;
    const ref = doc(db, "usuarios", u.uid);
    const r = {};
    if (aciertosTotales >= 20) r.estrella = true;
    if (aciertosTotales >= 50) r.medalla = true;
    if (aciertosTotales >= 100) r.trofeo = true;
    await updateDoc(ref, { recompensas: r }, { merge: true });
}
