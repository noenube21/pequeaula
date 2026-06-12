// =======================================
// SUPABASE INIT
// =======================================

const SUPABASE_URL = "https://adclnjzcimqktzilvldp.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkY2xuanpjaW1xa3R6aWx2bGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjI1NDAsImV4cCI6MjA5NjEzODU0MH0.7v7WAeHBUiBVmnZ8ycnU30Gw9a0wWr8JPIrCEPXMHFc";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("SUPABASE CARGADO");


// =======================================
// ESTADO GLOBAL (MEMORIA)
// =======================================

window.datos = {
  partidas: 0,
  aciertos: 0,
  errores: 0,
  niveles: {}
};


// =======================================
// CARGAR PROGRESO DESDE SUPABASE
// =======================================

async function cargarProgreso(uid) {

  const { data, error } = await db
    .from("progreso")
    .select("*")
    .eq("uid", uid);

  if (error) {
    console.error("ERROR CARGA:", error);
    return null;
  }

  const datos = {
    partidas: 0,
    aciertos: 0,
    errores: 0,
    niveles: {}
  };

  for (const row of data) {

    datos.niveles[row.nivel] = {
      puntos: row.puntos || 0,
      aciertos: 0,
      errores: 0
    };
  }

  window.datos = datos;

  console.log("📦 PROGRESO CARGADO:", window.datos);

  mostrarEstadisticas();
}

window.cargarProgreso = cargarProgreso;


// =======================================
// GUARDAR PROGRESO EN SUPABASE
// =======================================

async function guardarProgreso(uid, juego, nivel, puntos) {

  const { error } = await db
    .from("progreso")
    .upsert(
      [{
        uid,
        juego,
        nivel,
        puntos
      }],
      {
        onConflict: "uid,juego,nivel"
      }
    );

  if (error) {
    console.error("ERROR GUARDADO:", error);
    return false;
  }

  return true;
}

window.guardarProgreso = guardarProgreso;


// =======================================
// REGISTRAR RESULTADO (JUEGO)
// =======================================

window.registrarResultado = async function (asignaturaNivel, acierto, error) {

  let datos = window.datos;

  // GLOBAL
  datos.partidas += 1;
  datos.aciertos += acierto;
  datos.errores += error;

  // NIVEL
  if (!datos.niveles[asignaturaNivel]) {
    datos.niveles[asignaturaNivel] = {
      puntos: 0,
      aciertos: 0,
      errores: 0
    };
  }

  datos.niveles[asignaturaNivel].aciertos += acierto;
  datos.niveles[asignaturaNivel].errores += error;
  datos.niveles[asignaturaNivel].puntos += acierto;

  // 🔥 GUARDAR EN SUPABASE
  await guardarProgreso(
    window.uid,
    "juego",
    asignaturaNivel,
    datos.niveles[asignaturaNivel].puntos
  );

  console.log("✅ PROGRESO ACTUALIZADO:", datos);

  mostrarEstadisticas();
};


// =======================================
// MOSTRAR ESTADÍSTICAS
// =======================================

function mostrarEstadisticas() {

  const datos = window.datos;
  if (!datos) return;

  const partidas = datos.partidas || 0;
  const aciertos = datos.aciertos || 0;
  const errores = datos.errores || 0;

  const total = aciertos + errores;

  const porcentaje = total > 0
    ? Math.round((aciertos / total) * 100)
    : 0;

  document.getElementById("partidas").textContent = partidas;
  document.getElementById("aciertos").textContent = aciertos;
  document.getElementById("errores").textContent = errores;
  document.getElementById("porcentaje").textContent = porcentaje + "%";
}

window.mostrarEstadisticas = mostrarEstadisticas;


// =======================================
// RESET PROGRESO
// =======================================

window.resetearProgreso = function () {

  window.datos = {
    partidas: 0,
    aciertos: 0,
    errores: 0,
    niveles: {}
  };

  db.from("progreso")
    .delete()
    .eq("uid", window.uid);

  mostrarEstadisticas();

  console.log("RESET COMPLETO");
};
