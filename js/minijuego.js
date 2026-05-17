const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ✅ PROGRESO (recompensas)
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0 };

// =======================================
// 🎨 AVATAR SEGÚN RECOMPENSAS

let colorJugador = "blue";
let velocidad = 5;

if (datos.aciertos >= 5) colorJugador = "green";
if (datos.aciertos >= 10) colorJugador = "purple";
if (datos.aciertos >= 20) colorJugador = "gold";

if (datos.aciertos >= 15) velocidad = 7; // bonus

// =======================================
// PERSONAJE
let jugador = {
    x: 180,
    y: 430,
    w: 40,
    h: 40,
    vel: velocidad
};

// OBJETOS
let objetos = [];

// EFECTOS (para animación)
let efectos = [];

// PUNTOS
let puntos = 0;


// =======================================
// CONTROLES
document.addEventListener("keydown", e => {

    if (e.key === "ArrowLeft") {
        jugador.x -= jugador.vel;
    }

    if (e.key === "ArrowRight") {
        jugador.x += jugador.vel;
    }

});


// =======================================
// CREAR OBJETOS
function crearObjeto() {

    objetos.push({
        x: Math.random() * 360,
        y: 0,
        w: 30,
        h: 30,
        emoji: "📚"
    });

}


// =======================================
// EFECTO PARTÍCULAS
function crearEfecto(x,y){
    efectos.push({
        x,
        y,
        size: 10,
        life: 20
    });
}


// =======================================
function actualizar() {

    objetos.forEach(o => {
        o.y += 3;
    });

    efectos.forEach(e => {
        e.size += 1;
        e.life--;
    });

    // limpiar efectos
    efectos = efectos.filter(e => e.life > 0);

    objetos = objetos.filter(o => {

        let colision =
            o.x < jugador.x + jugador.w &&
            o.x + o.w > jugador.x &&
            o.y < jugador.y + jugador.h &&
            o.y + o.h > jugador.y;

        if (colision) {
            puntos++;

            // ruido visual
            crearEfecto(o.x, o.y);

            document.getElementById("puntos").innerText = puntos;

            return false;
        }

        return o.y < 500;
    });
}


// =======================================
function dibujar() {

    ctx.clearRect(0, 0, 400, 500);

    // ✅ Jugador (avatar)
    ctx.fillStyle = colorJugador;
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);

    // ✅ Ojos (más divertido)
    ctx.fillStyle = "white";
    ctx.fillRect(jugador.x+8, jugador.y+10, 5,5);
    ctx.fillRect(jugador.x+25, jugador.y+10, 5,5);

    // ✅ Objetos (emoji)
    ctx.font = "24px Arial";
    objetos.forEach(o => {
        ctx.fillText(o.emoji, o.x, o.y);
    });

    // ✅ EFECTOS
    efectos.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI*2);
        ctx.strokeStyle = "yellow";
        ctx.stroke();
    });

}


// =======================================
function loop() {

    if (Math.random() < 0.04) crearObjeto();

    actualizar();
    dibujar();

    requestAnimationFrame(loop);
}

loop();
