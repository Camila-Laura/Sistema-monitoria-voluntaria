const API_URL = "http://127.0.0.1:5000";
function Login() {
    const email = document.getElementById("login").value;
    const senha = document.getElementById("senha").value;

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            senha: senha
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            window.location.href = "/admin";  
        } else {
            alert("E-mail ou senha inválidos!");
        }
    })
    .catch(error => {
        console.error("Erro:", error);
    });
}
