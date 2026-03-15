import { auth, db } from "../firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

auth.onAuthStateChanged(async(u)=>{
    if(!u) return;
    const ref = doc(db,"usuarios",u.uid);
    const s = await getDoc(ref);
    if(!s.exists()) return;

    const d = s.data();
    const cont = document.getElementById("contenedorRecompensas");

    const lista = {
        estrella: "⭐",
        medalla: "🥇",
        trofeo: "🏆"
    };

    cont.innerHTML = "";

    if(!d.recompensas) return;

    for(const r in d.recompensas){
        if(d.recompensas[r]){
            const div = document.createElement("div");
            div.className="card";
            div.style.fontSize="60px";
            div.innerHTML = lista[r];
            cont.appendChild(div);
        }
    }
});
