async function criarSolicitante() {   
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const dificuldade = document.getElementById("dificuldade").value;
    const data = document.getElementById("data").value;
    const dias_disponivel = document.getElementById("dias_disponivel").value;
    const horario_disponivel = document.getElementById("horario_disponivel").value;
    const erroNome = document.getElementById("erro-nome");
    const erroEmail = document.getElementById("erro-email");
    const erroHorario = document.getElementById("erro-horario")

    if (nome.length < 2) {
        erroNome.style.display = 'block';
        return;
    } else {
        erroNome.style.display = 'none';
    }

    const regexEmail = /^[^\s]+@[^\s]+\.[^\s]+$/;
    if (!regexEmail.test(email)) {
        erroEmail.style.display = 'block';
        return;
    } else {
        erroEmail.style.display = 'none';
    }

    const regexHorario = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regexHorario.test(horario_disponivel)) {
        erroHorario.style.display = 'block';
        return;
    } else {
        erroHorario.style.display = 'none';
    }

    const resposta = await fetch("/solicitante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, dificuldade, data, dias_disponivel, horario_disponivel, email })
    });
    const resultado = await resposta.json();
    alert(resultado.message || resultado.erro || "Ocorreu um erro ao cadastrar.");
    window.location.href = "/";
}