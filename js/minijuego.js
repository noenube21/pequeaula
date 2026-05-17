const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =======================================
// DATOS
let recompensas = JSON.parse(localStorage.getItem("recompensas")) || [];

let jugador = {
    x: 180,
    y: 430,
    w: 40,
    h: 40,
    vel: 5
};

let objetos = [];
let efectos = [];
let puntos = 0;
let jugando = false;


// =======================================
// BOTÓN JUGAR
function iniciar(){
    puntos = 0;
    objetos = [];
    efectos = [];
    jugando = true;
}


// =======================================
// AÑADIR RECOMPENSA (PRUEBA)
function añadirRecompensa(){

    const lista = ["avatar1","avatar2","velocidad","super"];

    let nueva = lista[Math.floor(Math.random()*lista.length)];

    if (!recompensas.includes(nueva)) {
        recompensas.push(nueva);
        localStorage.setItem("recompensas", JSON.stringify(recompensas));
    }

    mostrarRecompensas();
}


// =======================================
// MOSTRAR RECOMPENSAS
function mostrarRecompensas(){

    let zona = document.getElementById("zonaRecompensas");
    zona.innerHTML = "";

    recompensas.forEach(r=>{
        let span = document.createElement("span");
        span.innerText = "🎁 " + r + " ";
        zona.appendChild(span);
    });
}

mostrarRecompensas();


// =======================================
// CAMBIAR AVATAR
function obtenerColor(){

    if (recompensas.includes("super")) return "gold";
    if (recompensas.includes("avatar2")) return "purple";
    if (recompensas.includes("avatar1")) return "green";

    return "blue";
}

function obtenerVelocidad(){

    if (recompensas.includes("velocidad")) return 8;
    return 5;
}


// =======================================
// CONTROLES
document.addEventListener("keydown", e => {

    if (!jugando) return;

    jugador.vel = obtenerVelocidad();

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
    efectos.push({ x,y, size:5, life:15 });
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

    // ✅ SUMAR PUNTOS
    if (recogidos > 0){
        puntos += recogidos;
        document.getElementById("puntos").innerText = puntos;
    }

    // efectos
    efectos.forEach(e=>{
        e.size++;
        e.life--;
    });

    efectos = efectos.filter(e=>e.life>0);
}


// =======================================
function dibujar(){

    ctx.clearRect(0,0,400,500);

    // jugador
    ctx.fillStyle = obtenerColor();
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);

    // ojos
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
``
