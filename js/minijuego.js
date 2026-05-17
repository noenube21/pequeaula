const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// ✅ CARGAR RECOMPENSAS (aciertos)
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0 };


// ✅ CAMBIAR PERSONAJE SEGÚN RECOMPENSAS
let colorJugador = "blue";

if (datos.aciertos > 5) colorJugador = "green";
if (datos.aciertos > 10) colorJugador = "purple";
if (datos.aciertos > 20) colorJugador = "gold";


// =======================================
let personaje = {
    x: 180,
    y: 430,
    w: 40,
    h: 40,
    velocidad: 5
};

let objetos = [];
let puntos = 0;


// =======================================
// CONTROLES
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") personaje.x -= personaje.velocidad;
    if (e.key === "ArrowRight") personaje.x += personaje.velocidad;
});


// ✅ BONUS: si tienes recompensa → más velocidad
if (datos.aciertos > 15) personaje.velocidad = 7;


// =======================================
// CREAR OBJETOS (LIBROS / REGALOS)
function crearObjeto() {
    objetos.push({
        x: Math.random() * 360,
        y: 0,
        w: 30,
        h: 30
    });
}


// =======================================
function actualizar() {

    objetos.forEach(o => o.y += 3);

    objetos = objetos.filter(o => {

        let colision =
            o.x < personaje.x + personaje.w &&
            o.x + o.w > personaje.x &&
            o.y < personaje.y + personaje.h &&
            o.y + o.h > personaje.y;

        if (colision) {
            puntos++;
            document.getElementById("puntos").innerText = puntos;
            return false;
        }

        return o.y < 500;
    });
}


// =======================================
function dibujar() {

    ctx.clearRect(0,0,400,500);

    // personaje (color según recompensa)
    ctx.fillStyle = colorJugador;
    ctx.fillRect(personaje.x, personaje.y, personaje.w, personaje.h);

    // objetos
    ctx.fillStyle = "#4CAF50";
    objetos.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
}


// =======================================
function loop() {

    if (Math.random() < 0.03) {
        crearObjeto();
    }

    actualizar();
    dibujar();

    requestAnimationFrame(loop);
}

loop();
