document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    let error = document.getElementById("error-message");

    if (user === "" || pass === "") {
        error.textContent = "Harap isi semua data.";
        return;
    }

    if (user === "admin" && pass === "admin123") {
        window.location.href = "dashboard.html";
    } else {
        error.textContent = "Username atau password salah.";
    }
});
