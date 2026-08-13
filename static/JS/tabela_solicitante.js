function carregarSolicitante() {
    fetch("/admin/solicitante")
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Dados recebidos:", data); 
        const tbody = document.querySelector("#tabelaSolicitante tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6'>Nenhum solicitante cadastrado.</td></tr>";
            return;
        }

        data.forEach(v => {
            const linha = `
                <tr>
                    <td>${v.id}</td>
                    <td>${v.nome}</td>
                    <td>${v.dificuldade}</td>
                    <td>${v.data}</td>
                    <td>${v.horario_disponivel}</td>
                    <td>${v.email}</td>
                    <td>
                        <button class="btn btn-primary btn-sm fw-semibold" onclick="listarDados(${v.id})">Listar</button>
                        <button class="btn btn-success btn-sm fw-semibold" onclick="editarSolicitante(${v.id})">Atualizar</button>
                        <button class="btn btn-danger btn-sm fw-semibold" onclick="deletarSolicitante(${v.id})">Deletar</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += linha;
        });
    })
    .catch(err => console.error("Erro ao carregar:", err)); 
}


function listarDados(id) {
    fetch(`/solicitante/${id}`)
    .then(response => response.json())
    .then(s => {
        alert(
            "ID: " + s.id +
            "\nNome: " + s.nome +
            "\nDificuldade: " + s.dificuldade +
            "\nData: " + s.data +
            "\nHorário Disponivel: " + s.horario_disponivel +
            "\nEmail: " + s.email
        );
    });
}

function editarSolicitante(id) {
    const novoNome = prompt("Novo nome:");
    const novoEmail = prompt("Novo email:");

    if (!novoNome || !novoEmail) return;

    fetch(`/admin/solicitante/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: novoNome,
            email: novoEmail
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        carregarSolicitante();
    });
}


function deletarSolicitante(id) {
    if (!confirm("Tem certeza que deseja deletar?")) return;

    fetch(`/admin/solicitante/${id}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        carregarSolicitante();
    });
}