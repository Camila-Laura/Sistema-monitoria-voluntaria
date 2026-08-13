function carregarVoluntarios() {
    fetch("/voluntarios")
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Dados recebidos:", data); 
        const tbody = document.querySelector("#tabelaVoluntarios tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6'>Nenhum voluntário cadastrado.</td></tr>";
            return;
        }

        data.forEach(v => {
            const linha = `
                <tr>
                    <td>${v.id}</td>
                    <td>${v.nome}</td>
                    <td>${v.disponibilidade}</td>
                    <td>${v.data}</td>
                    <td>${v.tipo_apoio}</td>
                    <td>${v.email}</td>
                    <td>
                        <button class="btn btn-primary fw-semibold btn-sm" onclick="listarDados(${v.id})">Listar</button>
                        <button class="btn btn-success fw-semibold btn-sm" onclick="editarVoluntario(${v.id})">Atualizar</button>
                        <button class="btn btn-danger fw-semibold btn-sm" onclick="deletarVoluntario(${v.id})">Deletar</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += linha;
        });
    })
    .catch(err => console.error("Erro ao carregar:", err));
}


function listarDados(id) {
    fetch(`/voluntarios/${id}`)
    .then(response => response.json())
    .then(v => {
        alert(
            "ID: " + v.id +
            "\nNome: " + v.nome +
            "\nDisponibilidade: " + v.disponibilidade +
            "\nData: " + v.data +
            "\nTipo de Apoio: " + v.tipo_apoio +
            "\nEmail: " + v.email
        );
    });
}


function editarVoluntario(id) {
    const novoNome = prompt("Novo nome:");
    const novoEmail = prompt("Novo email:");

    if (!novoNome || !novoEmail) return;

    fetch(`/admin/voluntarios/${id}`, {
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
        carregarVoluntarios();
    });
}


function deletarVoluntario(id) {
    if (!confirm("Tem certeza que deseja deletar?")) return;

    fetch(`/admin/voluntarios/${id}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        carregarVoluntarios();
    });
}