let avatarSeleccionado = "";

function seleccionarAvatar(tipo) {
    avatarSeleccionado = tipo;
}

function login() {
    const nombre = document.getElementById("nombreAlumno").value.trim();

    if (nombre === "") {
        alert("Escribe tu nombre.");
        return;
    }

    if (avatarSeleccionado === "") {
        alert("Elige un avatar.");
        return;
    }

    localStorage.setItem("alumno", nombre);
    localStorage.setItem("avatar", avatarSeleccionado);

    window.location.href = "menu.html";
}

window.onload = () => {
    const avatar = localStorage.getItem("avatar");
    const avatarMenu = document.getElementById("avatarMenu");

    if (avatarMenu && avatar) {
        avatarMenu.src = avatar === "chico"
            ? "assets/img/avatar-chico.png"
            : "assets/img/avatar-chica.png";
    }
};

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "login.html";
}
