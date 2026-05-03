// =====================================================
// IMPORTS
// =====================================================
import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// =====================================================
// REGISTRO DE USUARIO
// =====================================================
const formRegistro = document.getElementById("form-registro");

if (formRegistro) {

    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = formRegistro.nombre.value;
        const email = formRegistro.email.value;
        const password = formRegistro.password.value;
        const avatar = formRegistro.avatar.value;

        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre,
                email: email,
                avatar: avatar,
                partidas: 0,
                aciertos: 0,
                errores: 0
            });

            alert("✅ Cuenta creada correctamente");
            location.href = "login.html";

        } catch (error) {

            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                alert("❗ Este email ya está en uso");
            } else {
                alert("❌ Error al crear la cuenta");
            }
        }
    });
}


// =====================================================
// LOGIN DE USUARIO
// =====================================================
const formLogin = document.getElementById("form-login");

if (formLogin) {

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = formLogin.email.value;
        const password = formLogin.password.value;

        try {

            await signInWithEmailAndPassword(auth, email, password);

            // 👉 Ir al menú
            location.href = "menu.html";

        } catch (error) {

            console.error(error);

            if (error.code === "auth/user-not-found") {
                alert("❌ Usuario no encontrado");
            } else if (error.code === "auth/wrong-password") {
                alert("❌ Contraseña incorrecta");
            } else {
                alert("❌ Error al iniciar sesión");
            }
        }
    });
}


// =====================================================
// RECUPERAR CONTRASEÑA
// =====================================================
export function resetPassword() {

    const email = prompt("Introduce tu email para recuperar la contraseña:");

    if (!email) return;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("✅ Email de recuperación enviado");
        })
        .catch(() => {
            alert("❌ Error al enviar el email");
        });
}
