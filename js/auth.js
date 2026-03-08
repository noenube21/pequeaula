import { auth, db } from "../firebase-config.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const formRegistro = document.getElementById("form-registro");
const formLogin = document.getElementById("form-login");

/* ------------------ REGISTRO ------------------ */
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const nombre = e.target.nombre.value;
    const avatar = e.target.avatar.value;

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(cred.user);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nombre,
      avatar,
      nivel: 1,
      puntos: 0
    });

    alert("Cuenta creada. Revisa tu correo y verifica tu email antes de iniciar sesión.");

    // Cierra sesión para evitar que entre sin verificar
    await signOut(auth);
  });
}

/* ------------------ LOGIN ------------------ */
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (!cred.user.emailVerified) {
      alert("Debes verificar tu correo antes de entrar.");
      await signOut(auth);
      return;
    }

    // Si está verificado, redirige al menú
    window.location.href = "menu.html";
  });
}

/* ------------------ AUTO LOGIN CONTROLADO ------------------ */
onAuthStateChanged(auth, async (user) => {
  // Solo auto-login si NO estamos en login o registro
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



