// async function criarVoluntario() {
//     const nome = document.getElementById("nome").value;
//     const disponibilidade = document.getElementById("disponibilidade").value;
//     const tipo_apoio = document.getElementById("tipo_apoio").value;
//     const email = document.getElementById("email").value;

//    const resposta = await fetch("/voluntarios", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             nome: nome,
//             disponibilidade: disponibilidade,
//             tipo_apoio: tipo_apoio,
//             email: email,
//         })
//     });

//     const data = await resposta.json();
//     if (resposta.ok) {
//         window.location.href = "/"; 
//     } else {
//         alert(data.message); 
//     }
// }
async function criarVoluntario() {   
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const tipo_apoio = document.getElementById("tipo_apoio").value;  
    const data = document.getElementById("data").value;  
    const data_final = document.getElementById("data_final").value; 
    const dias_disponivel = document.getElementById("dias_disponivel").value;    
    const disponibilidade = document.getElementById("disponibilidade").value.trim(); 
    const erroNome = document.getElementById("erro-nome");
    const erroEmail = document.getElementById("erro-email");
    const erroHorario = document.getElementById("erro-horario");

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
    if (!regexHorario.test(disponibilidade)) {
        erroHorario.style.display = 'block';
        return;
    } else {
        erroHorario.style.display = 'none';
    }

    const resposta = await fetch("/voluntarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, disponibilidade, data, data_final, dias_disponivel, tipo_apoio, email })
    });
    const resultado = await resposta.json();
    alert(resultado.message || resultado.erro || "Ocorreu um erro ao cadastrar.");
    window.location.href = "/";
}