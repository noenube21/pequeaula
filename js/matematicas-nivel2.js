import { auth, db } from "../firebase-config.js";
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

async function guardar(aciertos, errores) {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "usuarios", user.uid), {
        partidas: increment(1),
        aciertos: increment(aciertos),
        errores: increment(errores)
    });
}

let a, b, operador;

function generar() {
    a = Math.floor(Math.random() * 20);
    b = Math.floor(Math.random() * 20);

    operador = Math.random() < 0.5 ? "+" : "-";

    document.getElementById("pregunta").innerText = `${a} ${operador} ${b} = ?`;
}

function comprobar() {
    const r = parseInt(document.getElementById("respuesta").value);
    const out = document.getElementById("resultado");

    let correcta = operador === "+" ? a + b : a - b;

    let ac = 0, er = 0;

    if (r === correcta) {
        out.innerText = "¡Correcto!";
        out.style.color = "green";
        ac = 1;
    } else {
        out.innerText = `Incorrecto. Era ${correcta}`;
        out.style.color = "red";
        er = 1;
    }

    guardar(ac, er);
    document.getElementById("respuesta").value = "";
    generar();
}

window.comprobar = comprobar;
generar();
