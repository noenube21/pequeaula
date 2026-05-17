const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// PROGRESO
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0 };

// RECOMPENSAS
let recompensas = [];
if (datos.aciertos >= 3) recompensas.push("verde");
if (datos.aciertos >= 10) recompensas.push("morado");
if (datos.aciertos >= 15) recompensas.push("dorado");
if (datos.aciertos >= 6) recompensas.push("velocidad");

// AVATAR
function colorJugador(){
    if (recompensas.includes("dorado")) return "gold";
    if (recompensas.includes("morado")) return "purple";
    if (recompensas.includes("verde")) return "green";
    return "blue";
}

// VELOCIDAD (más lento base)
function velocidad(){
    return recompensas.includes("velocidad") ? 5 : 3;
}

// JUGADOR
let jugador = { x:180, y:430, w:40, h:40 };

// OBJETOS
let objetos = [];
let puntos = 0;
let vidas = 3;
let jugando = false;

// CONTROLES
document.addEventListener("keydown", e=>{
    if (!jugando) return;

    if (e.key==="ArrowLeft") jugador.x -= velocidad();
    if (e.key==="ArrowRight") jugador.x += velocidad();
});

// INICIAR
function iniciar(){
    puntos = 0;
    vidas = 3;
    objetos = [];
    jugando = true;
}

// CREAR OBJETOS (MUCHO MÁS CLARO)
function crearObjeto(){

    let esMalo = Math.random() < 0.35; // 🔥 AHORA SALEN MUCHOS MALOS

    objetos.push({
        x: Math.random()*360,
        y: 0,
        tipo: esMalo ? "malo" : "bueno",
        emoji: esMalo ? "✂️" : "⭐"
    });
}

// ACTUALIZAR
function actualizar(){

    objetos.forEach(o => o.y += 1.8); // 🔥 MÁS LENTO

    objetos = objetos.filter(o=>{

        let col =
            o.x < jugador.x + jugador.w &&
            o.x + 20 > jugador.x &&
            o.y < jugador.y + jugador.h &&
            o.y + 20 > jugador.y;

        if (col){

            if (o.tipo==="bueno"){
                puntos++;
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

// DIBUJAR
function dibujar(){

    ctx.clearRect(0,0,400,500);

    // ✅ FONDO BONITO
    ctx.fillStyle = "#e1f5fe";
    ctx.fillRect(0,0,400,500);

    // ✅ PUNTOS Y VIDAS DENTRO DEL CANVAS (ARRIBA)
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("⭐ " + puntos, 10, 25);
    ctx.fillText("❤️ " + vidas, 300, 25);

    // JUGADOR
    ctx.fillStyle = colorJugador();
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);

    // OJOS
    ctx.fillStyle="white";
    ctx.fillRect(jugador.x+8,jugador.y+10,5,5);
    ctx.fillRect(jugador.x+25,jugador.y+10,5,5);

    // OBJETOS
    ctx.font="22px Arial";
    objetos.forEach(o=>{
        ctx.fillText(o.emoji,o.x,o.y);
    });

}

// LOOP
function loop(){

    if (jugando){

        if (Math.random()<0.06) crearObjeto();

        actualizar();
        dibujar();
    }

    requestAnimationFrame(loop);
}

loop();
