// =======================================
// ✅ CARGAR PROGRESO (ACERTOS)
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0 };


// =======================================
// 🎁 LISTA DE RECOMPENSAS
const recompensas = [

    { nombre: "🧑‍🎨 Avatar colorido", puntos: 3 },
    { nombre: "🎗️ Pulsera mágica", puntos: 6 },
    { nombre: "⚽ Pelota", puntos: 10 },
    { nombre: "🧸 Muñeco", puntos: 15 },
    { nombre: "🏆 Trofeo oro", puntos: 20 },
    { nombre: "🎁 Súper premio", puntos: 25 }

];


// =======================================
// ✅ CONTENEDOR
const contenedor = document.getElementById("contenedorRecompensas");


// =======================================
// ✅ RECOMPENSAS DESBLOQUEADAS
let desbloqueadas = [];


// =======================================
// 🎯 CREAR TARJETAS
recompensas.forEach(r => {

    const card = document.createElement("div");
    card.className = "card";

    if (datos.aciertos >= r.puntos) {

        // ✅ DESBLOQUEADA
        card.innerHTML = `
            <h3>${r.nombre}</h3>
            <p style="color:green;">✅ Desbloqueado</p>
        `;

        card.style.background = "#d4f8d4";

        desbloqueadas.push(r.nombre);

        // pequeña animación
        card.style.transition = "0.3s";
        card.onmouseover = () => card.style.transform = "scale(1.05)";
        card.onmouseleave = () => card.style.transform = "scale(1)";

    } else {

        // 🔒 BLOQUEADA
        card.innerHTML = `
            <h3>❓ ???</h3>
            <p>🔒 Necesitas ${r.puntos} aciertos</p>
        `;

        card.style.opacity = "0.5";
    }

    contenedor.appendChild(card);

});


// =======================================
// ✅ GUARDAR PARA MINIJUEGO
localStorage.setItem("recompensas", JSON.stringify(desbloqueadas));


// =======================================
// ✅ DEBUG (para comprobar)
console.log("Recompensas guardadas:", desbloqueadas);
