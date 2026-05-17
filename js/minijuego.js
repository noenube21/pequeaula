const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let personaje = {
    x: 180,
    y: 430,
    w: 40,
    h: 40,
    velocidad: 5
};

let libros = [];
let puntos = 0;


// =======================================
// CONTROLES
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") personaje.x -= personaje.velocidad;
    if (e.key === "ArrowRight") personaje.x += personaje.velocidad;
});


// =======================================
// GENERAR LIBROS
function crearLibro() {
    libros.push({
        x: Math.random() * 360,
        y: 0,
        w: 30,
        h: 30
    });
}


// =======================================
// MOVIMIENTO
function actualizar() {

    libros.forEach(l => l.y += 3);

    // colisiones
    libros = libros.filter(l => {

        if (
            l.x < personaje.x + personaje.w &&
            l.x + l.w > personaje.x &&
            l.y < personaje.y + personaje.h &&
            l.y + l.h > personaje.y
        ) {
            puntos++;
            document.getElementById("puntos").innerText = puntos;
            return false;
        }

        return l.y < 500;
    });
}


// =======================================
// DIBUJAR
function dibujar() {

    ctx.clearRect(0,0,400,500);

    // personaje
    ctx.fillStyle = "blue";
    ctx.fillRect(personaje.x, personaje.y, personaje.w, personaje.h);

    // libros
    ctx.fillStyle = "green";
    libros.forEach(l => ctx.fillRect(l.x, l.y, l.w, l.h));
}


// =======================================
// LOOP
function loop() {

    if (Math.random() < 0.03) crearLibro();

    actualizar();
    dibujar();

    requestAnimationFrame(loop);
}

loop();
