const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =======================================
// ✅ PROGRESO REAL (ACERTOS)
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0 };

// =======================================
// ✅ GENERAR RECOMPENSAS SEGÚN ACIERTOS
let recompensas = [];

if (datos.aciertos >= 3) recompensas.push("avatar verde");
if (datos.aciertos >= 6) recompensas.push("velocidad");
if (datos.aciertos >= 10) recompensas.push("avatar morado");
if (datos.aciertos >= 15) recompensas.push("avatar dorado");

// mostrar en pantalla
const zona = document.getElementById("zonaRecompensas");
recompensas.forEach(r => {
    let span = document.createElement("span");
    span.innerText = "🎁 " + r;
    zona.appendChild(span);
});


// =======================================
// ✅ AVATAR SEGÚN RECOMPENSAS
function obtenerColor(){
    if (recompensas.includes("avatar dorado")) return "gold";
    if (recompensas.includes("avatar morado")) return "purple";
    if (recompensas.includes("avatar verde")) return "green";
    return "blue";
}

function obtenerVel(){
    if (recompensas.includes("velocidad")) return 8;
    return 5;
}


// =======================================
let jugador = {
    x: 180,
    y: 430,
    w: 40,
    h: 40,
    vel: obtenerVel()
};

let objetos = [];
let efectos = [];
let puntos = 0;
let jugando = false;


// =======================================
function iniciar(){
    puntos = 0;
    objetos = [];
    efectos = [];
    jugando = true;
}


// =======================================
document.addEventListener("keydown", e => {

    if (!jugando) return;

    jugador.vel = obtenerVel();

    if (e.key === "ArrowLeft") jugador.x -= jugador.vel;
    if (e.key === "ArrowRight") jugador.x += jugador.vel;
});


// =======================================
function crearObjeto(){
    objetos.push({
        x: Math.random()*360,
        y: 0,
        emoji: ["📚","🎁","⭐"][Math.floor(Math.random()*3)]
    });
}


// =======================================
function crearEfecto(x,y){
    efectos.push({ x,y,size:5,life:15 });
}


// =======================================
function actualizar(){

    objetos.forEach(o => o.y += 3);

    let recogidos = 0;

    objetos = objetos.filter(o=>{

        let colision =
            o.x < jugador.x + jugador.w &&
            o.x + 20 > jugador.x &&
            o.y < jugador.y + jugador.h &&
            o.y + 20 > jugador.y;

        if (colision){
            recogidos++;
            crearEfecto(o.x,o.y);
            return false;
        }

        return o.y < 500;
    });

    if (recogidos > 0){
        puntos += recogidos;
        document.getElementById("puntos").innerText = puntos;
    }

    efectos.forEach(e=>{
        e.size++;
        e.life--;
    });

    efectos = efectos.filter(e=>e.life>0);
}


// =======================================
function dibujar(){

    ctx.clearRect(0,0,400,500);

    // avatar
    ctx.fillStyle = obtenerColor();
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);

    // cara divertida
    ctx.fillStyle="white";
    ctx.fillRect(jugador.x+8, jugador.y+10,5,5);
    ctx.fillRect(jugador.x+25, jugador.y+10,5,5);

    // objetos
    ctx.font="22px Arial";
    objetos.forEach(o=>{
        ctx.fillText(o.emoji,o.x,o.y);
    });

    // efectos
    efectos.forEach(e=>{
        ctx.beginPath();
        ctx.arc(e.x,e.y,e.size,0,Math.PI*2);
        ctx.strokeStyle="yellow";
        ctx.stroke();
    });
}


// =======================================
function loop(){

    if (jugando){

        if(Math.random()<0.05) crearObjeto();

        actualizar();
        dibujar();
    }

    requestAnimationFrame(loop);
}

loop();
