const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// personaje
let jugador = {
    x: 180,
    y: 430,
    w: 40,
    h: 40,
    vel: 5
};

// objetos que caen
let objetos = [];
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
        h: 30
    });

}

// =======================================
// ACTUALIZAR
function actualizar() {

    objetos.forEach(o => {
        o.y += 3;
    });

    // colisiones
    objetos = objetos.filter(o => {

        let colision =
            o.x < jugador.x + jugador.w &&
            o.x + o.w > jugador.x &&
            o.y < jugador.y + jugador.h &&
            o.y + o.h > jugador.y;

        if (colision) {
            puntos++;
            document.getElementById("puntos").innerText = puntos;
            return false;
        }

        return o.y < 500;
    });
}


// =======================================
// DIBUJAR
function dibujar() {

    ctx.clearRect(0, 0, 400, 500);

    // jugador
    ctx.fillStyle = "blue";
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);

    // objetos
    ctx.fillStyle = "green";
    objetos.forEach(o => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });

}


// =======================================
// LOOP
function loop() {

    if (Math.random() < 0.03) {
        crearObjeto();
    }

    actualizar();
    dibujar();

    requestAnimationFrame(loop);
}

loop();
