const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =======================================
// ✅ CARGAR RECOMPENSAS REALES
let recompensas = JSON.parse(localStorage.getItem("recompensas")) || [];

// ✅ MOSTRAR RECOMPENSAS BIEN
const zona = document.getElementById("zonaRecompensas");
zona.innerHTML = "";

// SI NO TIENE
if (recompensas.length === 0) {
    zona.innerHTML = "<p>❌ No tienes recompensas aún</p>";
} else {
    recompensas.forEach(r => {

        let card = document.createElement("div");

        card.innerText = "🎁 " + r;

        card.style.background = "#ffe082";
        card.style.padding = "10px";
        card.style.margin = "10px";
        card.style.borderRadius = "10px";
        card.style.fontWeight = "bold";
        card.style.textAlign = "center";
        card.style.boxShadow = "0 0 5px rgba(0,0,0,0.2)";

        zona.appendChild(card);
    });
}


// =======================================
// 🎨 AVATAR SEGÚN RECOMPENSAS
function colorJugador(){
    if (recompensas.includes("🏆 Trofeo oro")) return "gold";
    if (recompensas.includes("🧑‍🎨 Avatar colorido")) return "purple";
    if (recompensas.includes("🧸 Muñeco")) return "green";
    return "blue";
}


// =======================================
// ⚡ VELOCIDAD
function velocidad(){
    if (recompensas.includes("🎗️ Pulsera mágica")) return 5;
    return 3;
}


// =======================================
// JUGADOR
let jugador = {
    x: 180,
    y: 430,
    w: 40,
    h: 40
};

let objetos = [];
let puntos = 0;
let vidas = 3;
let jugando = false;


// =======================================
// CONTROLES
document.addEventListener("keydown", e => {

    if (!jugando) return;

    if (e.key === "ArrowLeft") jugador.x -= velocidad();
    if (e.key === "ArrowRight") jugador.x += velocidad();

});


// =======================================
// INICIAR
function iniciar(){
    puntos = 0;
    vidas = 3;
    objetos = [];
    jugando = true;
}


// =======================================
// CREAR OBJETOS
function crearObjeto(){

    let esMalo = Math.random() < 0.45;

    objetos.push({
        x: Math.random() * 360,
        y: 0,
        tipo: esMalo ? "malo" : "bueno",
        emoji: esMalo 
            ? "✂️" 
            : (recompensas.includes("🎁 Súper premio") ? "🎁" : "⭐")
    });
}


// =======================================
// ACTUALIZAR
function actualizar(){

    objetos.forEach(o => o.y += 1.5);

    objetos = objetos.filter(o => {

        let colision =
            o.x < jugador.x + jugador.w &&
            o.x + 20 > jugador.x &&
            o.y < jugador.y + jugador.h &&
            o.y + 20 > jugador.y;

        if (colision){

            if (o.tipo === "bueno"){

                // ⚽ doble puntos
                if (recompensas.includes("⚽ Pelota")){
                    puntos += 2;
                } else {
                    puntos++;
                }

            } else {

                vidas--;

                if (vidas <= 0){
                    jugando = false;
                    alert("💀 GAME OVER\nPuntos: " + puntos);
                }
            }

            return false;
        }

        return o.y < 500;
    });
}


// =======================================
// DIBUJAR
function dibujar(){

    ctx.clearRect(0,0,400,500);

    // FONDO
    ctx.fillStyle = "#e1f5fe";
    ctx.fillRect(0,0,400,500);

    // ⭐ PUNTOS CENTRADOS
    ctx.fillStyle = "black";
    ctx.font = "26px Arial";
    ctx.fillText("⭐ " + puntos, 150, 30);

    // ❤️ VIDAS
    ctx.fillText("❤️ " + vidas, 300, 30);

    // JUGADOR
    ctx.fillStyle = colorJugador();
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);

    // CARA
    ctx.fillStyle = "white";
    ctx.fillRect(jugador.x+8, jugador.y+10,5,5);
    ctx.fillRect(jugador.x+25, jugador.y+10,5,5);

    // OBJETOS
    ctx.font = "24px Arial";
    objetos.forEach(o => {
        ctx.fillText(o.emoji, o.x, o.y);
    });
}


// =======================================
// LOOP
function loop(){

    if (jugando){

        if (Math.random() < 0.07) crearObjeto();

        actualizar();
        dibujar();
    }

    requestAnimationFrame(loop);
}

loop();


// =======================================
// BOTÓN JUGAR
window.iniciar = iniciar;
