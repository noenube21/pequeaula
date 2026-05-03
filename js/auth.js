import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
// REGISTRO DE USUARIO
// =====================================================

const form = document.getElementById("form-registro");

if (form) {

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = form.nombre.value;
        const email = form.email.value;
        const password = form.password.value;
        const avatar = form.avatar.value;

        try {

            // ✅ Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ✅ Guardar datos adicionales en Firestore
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre,
                email: email,
                avatar: avatar,
                partidas: 0,
                aciertos: 0,
                errores: 0
            });

            // ✅ Confirmación
            alert("Cuenta creada correctamente");

            // ✅ REDIRECCIÓN AUTOMÁTICA
            location.href = "login.html";

        } catch (error) {

            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                alert("Este email ya está en uso");
            } else {
                alert("Error al crear la cuenta");
            }
        }

    });
}
``
