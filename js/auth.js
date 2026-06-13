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

/* ------------------ UI ------------------ */
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
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);

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

      } catch (err) {
        console.log("ERROR FIRESTORE:", err);
      }

      alert("Cuenta creada. Verifica tu email ⛔");
      await signOut(auth);
      window.location.href = "login.html";

    } catch (error) {

      if (error.code === "auth/email-already-in-use") {
        alert("Email ya registrado");
      } else if (error.code === "auth/weak-password") {
        alert("Contraseña débil");
      } else {
        alert("Error al crear cuenta");
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
        showMessage("Verifica tu email");
        await signOut(auth);
        return;
      }

      showMessage("Accediendo...", "success");
      window.location.href = "menu.html";

    } catch (error) {
      showMessage("Login incorrecto");
    }
  });
}

/* ------------------ RESET PASSWORD ------------------ */
window.resetPassword = async function () {
  const email = prompt("Introduce tu email:");
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Correo enviado ✅");
  } catch {
    alert("Error ❌");
  }
};

/* ------------------ CONTROL LOGIN ------------------ */
onAuthStateChanged(auth, async (user) => {

  const enLogin = document.getElementById("form-login");
  const enRegistro = document.getElementById("form-registro");

  if (enLogin || enRegistro) return;

  // 🔥 SOLUCIÓN CLAVE
  if (!user) {
    console.log("⚠️ Usuario no logueado");
    return;
  }

  if (!user.emailVerified) {
    return;
  }

  // ✅ SOLO AQUÍ usamos uid
  window.uid = user.uid;
  window.userEmail = user.email;

  console.log("✅ UID:", window.uid);

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    localStorage.setItem("usuario", JSON.stringify(snap.data()));
    window.location.href = "./menu.html";
  }
});
