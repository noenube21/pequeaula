const SUPABASE_URL = "https://adclnjzcimqktzilvldp.supabase.co";
const SUPABASE_KEY = "sb_publishable_pAPn_RLTp3HGCExJts9x_Q_jtFoIIzT";

export async function guardarProgreso(usuario, puntos, materia, nivel){

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/progreso`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                usuario,
                puntos,
                materia,
                nivel
            })
        });

    } catch (err) {
        console.log("Error guardando en Supabase:", err);
    }
}
