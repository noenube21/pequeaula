let avatarSeleccionado = "";

function seleccionarAvatar(tipo) {
    avatarSeleccionado = tipo;
}

function entrar() {
    const nombre = document.getElementById("nombre").value.trim();

    if (nombre === "") {
        alert("Escribe tu nombre.");
        return;
    }

    if (avatarSeleccionado === "") {
        alert("Elige un avatar.");
        return;
    }

    // Guardar igual que auth.js hacía antes
    localStorage.setItem("alumno", nombre);
    localStorage.setItem("avatar", avatarSeleccionado);

    // Ir al menú como antes
    window.location.href = "menu.html";
}

// Cargar avatar en el menú
window.onload = () => {
    const avatar = localStorage.getItem("avatar");
    const avatarMenu = document.getElementById("avatarMenu");

    if (avatarMenu && avatar) {
        avatarMenu.src = avatar === "chico"
            ? "assets/img/avatar-chico.png"
            : "assets/img/avatar-chica.png";
    }
};
