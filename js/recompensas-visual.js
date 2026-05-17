// =======================================
// CARGAR PROGRESO LOCAL (simple)
let datos = JSON.parse(localStorage.getItem("progreso")) || {
    aciertos: 0
};

// =======================================
// LISTA DE RECOMPENSAS (visual)
const recompensas = [

    { nombre: "Avatar colorido", puntos: 3, icono: "🧑‍🎨" },
    { nombre: "Pulsera mágica", puntos: 6, icono: "🎗️" },
    { nombre: "Pelota", puntos: 10, icono: "⚽" },
    { nombre: "Muñeco", puntos: 15, icono: "🧸" },
    { nombre: "Trofeo oro", puntos: 20, icono: "🏆" },
    { nombre: "Súper premio", puntos: 25, icono: "🎁" }

];

// =======================================
// RENDERIZAR
const contenedor = document.getElementById("contenedorRecompensas");

recompensas.forEach(r => {

    const card = document.createElement("div");
    card.className = "card";

    // ✅ DESBLOQUEADO
    if (datos.aciertos >= r.puntos) {

        card.innerHTML = `
            <h3>${r.icono} ${r.nombre}</h3>
            <p style="color:green;">✅ Desbloqueado</p>
        `;

        card.style.background = "#d4f8d4";

    }
    
    // 🔒 BLOQUEADO
    else {

        card.innerHTML = `
            <h3>❓ ???</h3>
            <p>🔒 Necesitas ${r.puntos} aciertos</p>
        `;

        card.style.opacity = "0.5";
    }

    // ⭐ ANIMACIÓN AL PASAR RATÓN
    card.onmouseover = () => {
        card.style.transform = "scale(1.1)";
        card.style.transition = "0.2s";
    };

    card.onmouseleave = () => {
        card.style.transform = "scale(1)";
    };

    contenedor.appendChild(card);
});
