import { auth, db } from "../firebase-config.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const formRegistro = document.getElementById("form-registro");
const formLogin = document.getElementById("form-login");

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
  });
}

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (!cred.user.emailVerified) {
      alert("Debes verificar tu correo antes de entrar.");
      return;
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user && user.emailVerified) {
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      localStorage.setItem("usuario", JSON.stringify(snap.data()));
      window.location.href = "menu.html";
    }
  }
});


