document.addEventListener("DOMContentLoaded", carregarAtendimentos);

function carregarAtendimentos() {
    fetch("/api/atendimentos")
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector("#tabelaAtendimentos tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' class='text-center'>Nenhum atendimento cadastrado.</td></tr>";
            return;
        }

        data.forEach(a => {         //para cada dado que veio do banco de dados ele cria uma linha na tabela
            tbody.innerHTML += `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.voluntario_nome}</td>
                    <td>${a.solicitante_nome}</td>
                    <td>${a.dias_disponivel}</td>
                    <td>${a.status}</td>
                </tr>
            `;
        });
    })
    .catch(err => console.error("Erro:", err));
}