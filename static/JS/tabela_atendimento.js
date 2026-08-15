function mostrarSecao(id) {
    document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';

    const titulo = document.querySelector('.main-titulo');
    const cards = document.querySelector('.main-cards');
    const solicitante = document.querySelector('.card-solicitante');

    if (titulo) titulo.style.display = 'none';
    if (cards) cards.style.display = 'none';
    if (solicitante) solicitante.style.display = 'none';

    if (id === 'criar-atendimento') carregarAtendimentos();
    if (id === 'gerenciar-solicitante') carregarSolicitante();
    if (id === 'gerenciar-voluntario') carregarVoluntarios();
}

function mostrarInicio() {
    document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');

    const titulo = document.querySelector('.main-titulo');
    const cards = document.querySelector('.main-cards');
    const solicitante = document.querySelector('.card-solicitante');

    if (titulo) titulo.style.display = 'flex';   
    if (cards) cards.style.display = 'grid';     
    if (solicitante) solicitante.style.display = 'flex'; 
}

// -------------------- Verificar email ---------------------------
function emailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// -------------------- Carregar Atendimentos ---------------------------
function carregarAtendimentos() {
    fetch("/api/atendimentos")
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector("#tabelaAtendimentos tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4' class='text-center'>Nenhum atendimento cadastrado.</td></tr>";
            return;
        }

        data.forEach(a => {         //para cada dado que veio do banco de dados ele cria uma linha na tabela
            tbody.innerHTML += `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.voluntario_nome}</td>
                    <td>${a.solicitante_nome}</td>
                    <td>${a.status}</td>
                    <td>
                        ${a.status === "pendente" ? `<button onclick="marcarStatus(${a.id}, 'em andamento')" class="btn btn-warning fw-semibold btn-sm me-3">Em Andamento</button>` : ""}
                        ${a.status === "pendente" || a.status === "em andamento" ? `<button onclick="marcarStatus(${a.id}, 'atendido')" class="btn btn-success fw-semibold btn-sm me-3">Marcar Atendido</button>` : ""}
                        <button onclick="deletarAtendimento(${a.id})" class="btn btn-danger fw-semibold btn-sm">Deletar</button>
                    </td>
                </tr>
            `;
        });
    })
    .catch(err => console.error("Erro:", err));
    carregarConsultas();
}

// ------------------   Carregar Consultas  -----------------------------
function carregarConsultas() {
    // Voluntários
    fetch("/voluntarios")
        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector("#tabelaVoluntariosConsulta");
            tbody.innerHTML = "";
            data.forEach(v => {
                tbody.innerHTML += `
                    <tr>
                        <td>${v.id}</td>
                        <td>${v.nome}</td>
                        <td>${v.tipo_apoio}</td>
                        <td>${v.data}</td>
                        <td>${v.data_final}</td>
                        <td>${v.dias_disponivel}</td>
                        <td>${v.disponibilidade}</td>
                    </tr>
                `;
            });
        });

    // Solicitantes
    fetch("/admin/solicitante")
        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector("#tabelaSolicitantesConsulta");
            tbody.innerHTML = "";
            data.forEach(s => {
                tbody.innerHTML += `
                    <tr>
                        <td>${s.id}</td>
                        <td>${s.nome}</td>
                        <td>${s.dificuldade}</td>
                        <td>${s.data}</td>
                        <td>${s.dias_disponivel}</td>
                        <td>${s.horario_disponivel}</td>
                    </tr>
                `;
            });
        });
}

// ---------------------- Criar Atendimento ----------------------------
function criarAtendimento() {
    const voluntario_id = document.getElementById("voluntario_id").value; // responsavel por pegar os dados do input
    const solicitante_id = document.getElementById("solicitante_id").value;

    if (!voluntario_id || !solicitante_id) {        //faz a verificação para analisar se tem algum campo vazio
        alert("Preencha os dois campos!");
        return;
    }
    console.log("Enviando:", voluntario_id, solicitante_id);

    fetch("/api/atendimentos", {        //envia novo atendimento ao servidor
        method: "POST",
        headers: { "Content-Type": "application/json" }, // serve para informar ao servidor qual tipo de dado  ta sendo enviado
        body: JSON.stringify({
        voluntario_id: parseInt(voluntario_id), // responsavel por transformar os textos em numeros
        solicitante_id: parseInt(solicitante_id), 
        })
    })
    .then(response => response.json()) //responsavel por transformar as respostas do servidor em json
    .then(data => {                         //recebe os dados
        console.log("Resposta:", data)
        alert(data.message);
        carregarAtendimentos();
    });
}

// ------------------Deletar Atendimento -------------------------
function deletarAtendimento(id) {
    if (!confirm("Tem certeza que deseja deletar?")) return;

        fetch(`/api/atendimentos/${id}`, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            carregarAtendimentos();
    });
}


// ------------------ Marcar Atendimento como atendido -------------------------
// ------------------ Marcar status do atendimento -------------------------
function marcarStatus(id, status) {
    if (!confirm(`Marcar este atendimento como ${status}?`)) return;

    fetch(`/atender/${id}/${status}`, { method: "PUT" })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.erro);
        carregarAtendimentos();
    })
    .catch(err => console.error("Erro:", err));
}

// ---------------------------tabela socilitante-----------------------------------

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
                    <td>${v.dias_disponivel}</td>
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

// ------------------Listar Dados do solicitante -----------------------------
function listarDados(id) {
    fetch(`/solicitante/${id}`)
    .then(response => response.json())
    .then(s => {
        alert(
            "ID: " + s.id +
            "\nNome: " + s.nome +
            "\nMatéria: " + s.dificuldade +
            "\nData: " + s.data +
            "\nDias Disponivel: " + s.dias_disponivel +
            "\nHorário: " + s.horario_disponivel +
            "\nEmail: " + s.email
        );
    });
}

// ------------------Editar Dados do solicitante -----------------------------
function editarSolicitante(id) {
    const novoNome = prompt("Novo nome:");
    if (novoNome === null) return; 

    const novoMateria = prompt("Nova Materia:");
    const novaData = prompt("Nova Data:");
    const novoDia = prompt("Novo Dia da semana disponível:");
    const novoHorario = prompt("Novo Horario:");
    const novoEmail = prompt("Novo email:");

    if (!novoNome || !novoEmail) return;

    if (!emailValido(novoEmail)) {
        alert("E-mail inválido! Use um formato como exemplo@gmail.com");
        return;
    }

    fetch(`/admin/solicitante/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: novoNome,
            dificuldade: novoMateria || undefined,
            data: novaData || undefined,
            dia: novoDia || undefined,
            horario: novoHorario || undefined,
            email: novoEmail
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.erro || "Ocorreu um erro.");
        carregarSolicitante();
    });
}

// -------------------------Deletar Dados do solicitante -----------------------------
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


// ------------------------ tabela voluntario ------------------------------------------- 
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
                    <td>${v.tipo_apoio}</td>
                    <td>${v.disponibilidade}</td>
                    <td>${v.data}</td>
                    <td>${v.data_final}</td>
                    <td>${v.dias_disponivel}</td>
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

// ------------------   Listar Dados do Voluntario -----------------------------
function listarDados(id) {
    fetch(`/voluntarios/${id}`)
    .then(response => response.json())
    .then(v => {
        alert(
            "ID: " + v.id +
            "\nNome: " + v.nome +
            "\nMatéria: " + v.tipo_apoio +
            "\nHorário: " + v.disponibilidade +
            "\nData inicial: " + v.data +
            "\nData Final: " + v.data_final +
            "\nDia Disponivel: " + v.dias_disponivel +
            "\nEmail: " + v.email
        );
    });
}

// ------------------   Editar Dados do Voluntario -----------------------------
function editarVoluntario(id) {
    const novoNome = prompt("Novo nome:");
    if (novoNome === null) return; 

    const novoMateria = prompt("Nova Matéria:");
    const novoHorario = prompt("Novo Horário:");
    const novaData = prompt("Nova Data:");
    const novaDataFinal = prompt("Nova Data Final:");
    const novoDia = prompt("Novo Dia da semana disponível:");
    const novoEmail = prompt("Novo email:");

    if (!novoNome || !novoEmail) return;

    if (!emailValido(novoEmail)) {
        alert("E-mail inválido! Use um formato como exemplo@gmail.com");
        return;
    }

    fetch(`/admin/voluntarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: novoNome,
            materia: novoMateria || undefined,
            horario: novoHorario || undefined,
            data: novaData || undefined,
            data_final: novaDataFinal || undefined,
            dia: novoDia|| undefined,
            email: novoEmail
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.erro || "Ocorreu um erro.");
        carregarVoluntarios();
    });
}

// --------------------  Deletar Dados do Voluntario ----------------------------
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

// ------------------   Informações do ADM ----------------------------
function InfoAdmin() {
    const info = document.getElementById('info-admin');
    info.style.display = info.style.display === 'none' ? 'block' : 'none';
}


function DeletarAdmin() {
    if (!confirm("Tem certeza que deseja deletar sua conta?")) return;

    fetch("/api/admin/me", {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        window.location.href = "/login"; // manda pra tela de login
    });
}