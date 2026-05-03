import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail   // ✅ AÑADIDO
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { 
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const formRegistro = document.getElementById("form-registro");
const formLogin = document.getElementById("form-login");


// ================== REGISTRO ==================
if (formRegistro) {

  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;
    const nombre = e.target.nombre.value;
    const avatar = e.target.avatar.value;

    try {

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Verificación email
      await sendEmailVerification(cred.user);

      // Guardar usuario en Firestore
      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nombre,
        avatar,
        nivel: 1,
        puntos: 0
      });

      alert("Cuenta creada. Revisa tu correo y verifica tu email antes de iniciar sesión.");

      await signOut(auth);

    } catch (error) {
      console.error(error);
      alert("Error al crear cuenta");
    }
  });

}


// ================== LOGIN ==================
if (formLogin) {

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {

      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Verificar email
      if (!cred.user.emailVerified) {
        alert("Debes verificar tu correo antes de entrar.");
        await signOut(auth);
        return;
      }

      window.location.href = "menu.html";

    } catch (error) {
      console.error(error);
      alert("Email o contraseña incorrectos");
    }
  });

}


// ================== RECUPERAR CONTRASEÑA ==================
export async function resetPassword() {

  const email = prompt("Introduce tu email:");

  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Correo de recuperación enviado ✅");
  } catch (error) {
    console.error(error);
    alert("Error al enviar el correo ❌");
  }
}


// ================== AUTO LOGIN ==================
onAuthStateChanged(auth, async (user) => {

  const enLogin = document.getElementById("form-login");
  const enRegistro = document.getElementById("form-registro");

  if (enLogin || enRegistro) return;

  if (user && user.emailVerified) {

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      localStorage.setItem("usuario", JSON.stringify(snap.data()));
      window.location.href = "./menu.html";
    }
  }
});
