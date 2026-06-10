import { auth, db } from "../firebase-config.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { 
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const formRegistro = document.getElementById("form-registro");
const formLogin = document.getElementById("form-login");

/* ------------------ UI HELPERS (NUEVO) ------------------ */
function showMessage(text, type = "error") {
  const box = document.getElementById("login-message");
  if (!box) return;

  box.innerText = text;
  box.style.color = type === "error" ? "red" : "green";
}

/* ------------------ REGISTRO ------------------ */
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;
    const nombre = e.target.nombre.value;
    const avatar = e.target.avatar.value;

    try {
      // 1. Crear usuario en Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Enviar verificación
      await sendEmailVerification(cred.user);

      // 3. Guardar datos en Firestore (controlado)
      try {
        await setDoc(doc(db, "usuarios", cred.user.uid), {
          nombre,
          avatar,
          nivel: 1,
          puntos: 0
        });
        if(window.guardarUsuario){

  await window.guardarUsuario({
    email: email,
    nombre: nombre,
    avatar: avatar,
    nivel: 1,
    puntos: 0,
    partidas: 0,
    aciertos: 0,
    errores: 0
  });

}
      } catch (firestoreError) {
        console.log("ERROR FIRESTORE:", firestoreError);
        // no rompemos registro aunque falle esto
      }

      // 4. Mensaje correcto (esto es lo que te pide el profe)
      alert("Cuenta creada correctamente. Revisa tu correo para verificarla antes de iniciar sesión.");

      // 5. Cerrar sesión (importante para obligar verificación)
      await signOut(auth);

      // 6. Redirigir al login
      window.location.href = "login.html";

    } catch (error) {

      console.log("ERROR AUTH:", error);

      // mensajes claros
      if (error.code === "auth/email-already-in-use") {
        alert("Este email ya está registrado.");
      }

      else if (error.code === "auth/weak-password") {
        alert("La contraseña es demasiado débil (mínimo 6 caracteres).");
      }

      else if (error.code === "auth/invalid-email") {
        alert("El email no es válido.");
      }

      else {
        alert("Error al crear la cuenta. Intenta de nuevo.");
      }
    }
  });
}
/* ------------------ LOGIN ------------------ */
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!cred.user.emailVerified) {
        showMessage("Debes verificar tu correo antes de entrar.");
        await signOut(auth);
        return;
      }

      // 🔥 MEJORA UX: feedback antes de redirigir
      showMessage("Accediendo...", "success");

      window.location.href = "menu.html";

    } catch (error) {

      // 🔥 MEJORA: mensaje visible en pantalla (no solo alert)
      showMessage("Email o contraseña incorrectos");
    }
  });
}

/* ------------------ RECUPERAR CONTRASEÑA ------------------ */
window.resetPassword = async function () {

  const email = prompt("Introduce tu email:");

  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);

    alert("Correo enviado ✅. Revisa tu bandeja de entrada.");

  } catch (error) {

    alert("No se pudo enviar el correo ❌");
  }
};

/* ------------------ AUTO LOGIN CONTROLADO ------------------ */
onAuthStateChanged(auth, async (user) => {

  const enLogin = document.getElementById("form-login");
  const enRegistro = document.getElementById("form-registro");

  if (enLogin || enRegistro) return;
if (user && user.emailVerified) {

  console.log("EMAIL LOGIN:", user.email);

  const usuarioSupabase =
      await window.obtenerUsuario(user.email);

  console.log(
      "USUARIO SUPABASE:",
      usuarioSupabase
  );

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    localStorage.setItem("usuario", JSON.stringify(snap.data()));
    window.location.href = "./menu.html";
  }

}
