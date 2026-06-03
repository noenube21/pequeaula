import { guardarProgreso, cargarProgreso } from "./progreso.js";

// ================================
// ✅ GUARDAR TODO (LOCAL + FIREBASE)
// ================================
export async function guardarCompleto(datos){

    // local
    localStorage.setItem("progreso", JSON.stringify(datos));

    // firebase
    await guardarProgreso(datos);
}

// ================================
// ✅ CARGAR TODO (FIREBASE PRIORIDAD)
// ================================
export async function cargarCompleto(){

    const remoto = await cargarProgreso();

    if(remoto){
        return remoto;
    }

    return JSON.parse(localStorage.getItem("progreso")) || {
        aciertos: 0,
        puntos: 0
    };
}
