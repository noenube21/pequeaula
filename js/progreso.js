import { auth, db } from "../firebase-config.js";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// ✅ HACER GLOBAL
window.registrarResultado = async function (asignaturaNivel, acierto, error) {

    const user = auth.currentUser;
    if (!user) {
        console.log("NO HAY USUARIO");
        return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let datos = snap.exists() ? snap.data() : {};

    const partidas = (datos.partidas || 0) + 1;
    const aciertos = (datos.aciertos || 0) + acierto;
    const errores = (datos.errores || 0) + error;

    let progreso = datos.progreso || {};

    if (!progreso[asignaturaNivel]) {
        progreso[asignaturaNivel] = { aciertos: 0, errores: 0 };
    }

    progreso[asignaturaNivel].aciertos += acierto;
    progreso[asignaturaNivel].errores += error;

    await setDoc(ref, {
        partidas,
        aciertos,
        errores,
        progreso
    }, { merge: true });

    console.log("✅ GUARDADO:", asignaturaNivel);
};


window.resetearProgreso = async function () {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);

    await updateDoc(ref, {
        partidas: 0,
        aciertos: 0,
        errores: 0,
        progreso: {}
    });

    alert("Progreso reiniciado");
    location.reload();
};


// ✅ CARGAR PROGRESO
async function cargarProgreso() {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const d = snap.data();

    const partidas = d.partidas || 0;
    const aciertos = d.aciertos || 0;
    const errores = d.errores || 0;

    const total = aciertos + errores;
    const porcentaje = total ? Math.round(aciertos / total * 100) : 0;

    document.getElementById("partidas").textContent = partidas;
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("errores").textContent = errores;
    document.getElementById("porcentaje").textContent = porcentaje + "%";
}

auth.onAuthStateChanged(u => {
    if (u) cargarProgreso();
});
