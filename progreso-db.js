import { auth, db } from "./firebase-config.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* GUARDAR */

export async function guardarProgreso(datos){

    const usuario = auth.currentUser;

    if(!usuario) return;

    await setDoc(
        doc(db,"usuarios",usuario.uid),
        datos,
        { merge:true }
    );
}

/* CARGAR */

export async function cargarProgreso(){

    const usuario = auth.currentUser;

    if(!usuario) return null;

    const ref = doc(db,"usuarios",usuario.uid);

    const snap = await getDoc(ref);

    if(snap.exists()){
        return snap.data();
    }

    return null;
}
