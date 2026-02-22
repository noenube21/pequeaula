function cambiarIdioma(idioma) {
    localStorage.setItem("idioma", idioma);
    location.reload();
}

function traducir() {
    const idioma = localStorage.getItem("idioma") || "es";

    const textos = {
        es: {
            titulo: "App Educativa",
            login: "Iniciar sesión",
            entrar: "Entrar",
            menu: "Menú principal",
            jugar: "Jugar",
            progreso: "Ver progreso",
            asignaturas: "Asignaturas",
            cerrar: "Cerrar sesión"
        },
        en: {
            titulo: "Educational App",
            login: "Login",
            entrar: "Enter",
            menu: "Main menu",
            jugar: "Play",
            progreso: "Progress",
            asignaturas: "Subjects",
            cerrar: "Log out"
        }
    };

    document.querySelectorAll("[data-text]").forEach(el => {
        const key = el.getAttribute("data-text");
        el.textContent = textos[idioma][key];
    });
}

window.onload = traducir;
