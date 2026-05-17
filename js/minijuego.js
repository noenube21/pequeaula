const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ✅ CARGAR PROGRESO (ACERTOS)
let datos = JSON.parse(localStorage.getItem("progreso")) || { aciertos: 0 };

// ✅ RECOMPENSAS AUTOMÁTICAS
let recompensas = [];

if (datos.aciertos >= 3) recompensas.push("avatar verde");
if (datos.aciertos >= 6) recompensas.push("velocidad");
if (datos.aciertos >= 10) recompensas.push("avatar morado");
if (datos.aciertos >= 15) recompensas.push("avatar dorado");

// MOSTRAR
const zona = document.getElementById("zonaRecompensas");
recompensas.forEach(r=>{
    let s = document.createElement("span");
    s.innerText = "🎁 " + r + " ";
    zona.appendChild(s);
});

// AVATAR
function colorJugador(){
    if (recompensas.includes("avatar dorado")) return "gold";
    if (recompensas.includes("avatar morado")) return "purple";
    if (recompensas.includes("avatar verde")) return "green";
    return "blue";
}

function velocidad(){
    return recompensas.includes("velocidad") ? 6 : 4;
}

// JUGADOR
let jugador = {
    x:180,
    y:430,
    w:40,
    h:40
};

let objetos = [];
let puntos = 0;
let vidas = 3;
let jugando = false;

// CONTROLES
document.addEventListener("keydown", e=>{
    if(!jugando) return;

    if(e.key==="ArrowLeft") jugador.x -= velocidad();
    if(e.key==="ArrowRight") jugador.x += velocidad();
});

// INICIAR
function iniciar(){
    puntos = 0;
    vidas = 3;
    objetos = [];
    jugando = true;
    document.getElementById("puntos").innerText = puntos;
    actualizarVidas();
}

// CREAR OBJETO
function crearObjeto(){
    objetos.push({
        x: Math.random()*360,
        y: 0,
        tipo: Math.random() < 0.2 ? "malo" : "bueno",
        emoji: Math.random() < 0.2 ? "✂️" : "⭐"
    });
}

// VIDAS
function actualizarVidas(){
    document.getElementById("vidas").innerText = "❤️".repeat(vidas);
}

// UPDATE
function actualizar(){

    objetos.forEach(o=> o.y += 2); // 🔥 más lento

    objetos = objetos.filter(o=>{

        let col =
            o.x < jugador.x + jugador.w &&
            o.x + 20 > jugador.x &&
            o.y < jugador.y + jugador.h &&
            o.y + 20 > jugador.y;

        if(col){

            if(o.tipo==="bueno"){
                puntos++;
            }else{
                vidas--;
                actualizarVidas();

                if(vidas <= 0){
                    jugando = false;
                    alert("💀 GAME OVER\nPuntos: " + puntos);
                }
            }

            document.getElementById("puntos").innerText = puntos;
            return false;
        }

        return o.y < 500;
    });
}

// DIBUJAR
function dibujar(){

    ctx.clearRect(0,0,400,500);

    // jugador
    ctx.fillStyle = colorJugador();
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);

    // ojos
    ctx.fillStyle="white";
    ctx.fillRect(jugador.x+8,jugador.y+10,5,5);
    ctx.fillRect(jugador.x+25,jugador.y+10,5,5);

    // objetos
    ctx.font="22px Arial";
    objetos.forEach(o=>{
        ctx.fillText(o.emoji, o.x, o.y);
    });
}

// LOOP
function loop(){

    if(jugando){
        if(Math.random()<0.05) crearObjeto();
        actualizar();
        dibujar();
    }

    requestAnimationFrame(loop);
}

loop();
``
