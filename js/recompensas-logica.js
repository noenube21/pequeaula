import { db } from "./firebase-config.js";
import { auth } from "./firebase-config.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function comprobarRecompensas(porcentaje) {
    const u = auth.currentUser;
    if (!u) return;

    const ref = doc(db, "usuarios", u.uid);
    const recompensas = {};

    if (porcentaje >= 30) recompensas.moneda = true;      // 💰 Moneda
    if (porcentaje >= 50) recompensas.estrella = true;    // ⭐
    if (porcentaje >= 70) recompensas.medalla = true;     // 🥇
    if (porcentaje >= 90) recompensas.trofeo = true;      // 🏆

    await updateDoc(ref, { recompensas }, { merge: true });
}
