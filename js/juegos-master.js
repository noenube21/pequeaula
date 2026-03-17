const Juegos = {

    matematicas1: {
        generar: () => {
            const a = Math.floor(Math.random() * 10);
            const b = Math.floor(Math.random() * 10);
            return { p: `${a} + ${b}`, r: (a + b).toString() };
        }
    },

    matematicas2: {
        generar: () => {
            const a = Math.floor(Math.random() * 10 + 5);
            const b = Math.floor(Math.random() * 10);
            return { p: `${a} - ${b}`, r: (a - b).toString() };
        }
    },

    matematicas3: {
        generar: () => {
            const a = Math.floor(Math.random() * 10);
            const b = Math.floor(Math.random() * 10);
            return { p: `${a} × ${b}`, r: (a * b).toString() };
        }
    },

    ingles3: {
        memory: [
            ["dog","assets/img/dog.png"],
            ["house","assets/img/house.png"],
            ["apple","assets/img/apple.png"]
        ]
    },

    ciencias3: {
        memory: [
            ["sol","assets/img/sol.png"],
            ["luna","assets/img/luna.png"],
            ["mar","assets/img/mar.png"]
        ]
    }
};

let juegoActual = null;

export function iniciarJuego(key) {

    juegoActual = Juegos[key];

    const pregunta = document.getElementById("pregunta");
    const zona = document.getElementById("zona");

    pregunta.innerHTML = "";
    zona.innerHTML = "";

    // ────────────── TEXTOS ──────────────
    if (juegoActual.generar) {
        const q = juegoActual.generar();

        pregunta.innerText = q.p;

        window.comprobar = () => {
            const r = document.getElementById("respuesta").value.trim();
            document.getElementById("resultado").innerText =
                r === q.r ? "Correcto" : "Incorrecto";
        };

        return;
    }

    // ────────────── MEMORY ──────────────
    if (juegoActual.memory) {

        let cartas = [...juegoActual.memory, ...juegoActual.memory];
        cartas.sort(() => Math.random() - 0.5);

        cartas.forEach(carta => {
            const div = document.createElement("div");
            div.classList.add("carta");

            const img = document.createElement("img");
            img.src = carta[1];
            img.style.display = "none";

            div.appendChild(img);

            div.addEventListener("click", () => {
                img.style.display = "block";
            });

            zona.appendChild(div);
        });

        return;
    }
}
