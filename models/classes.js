// Ativação Automática dos Ícones na Viewport
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    configurarDataSistema();
});

// Arquivos de Registro Voláteis (Simulação de Escopo Local)
let acervoClientes = [];
let acervoReparos = [];
let roloInsumosCorrentes = [];
let clienteVinculadoOrdem = null;

// ================= 1. REGRA DE LOGIN / AUTENTICAÇÃO ESTREITA =================
function handleLogin(event) {
    event.preventDefault();
    const usuarioDigitado = document.getElementById("username").value;
    const senhaDigitada = document.getElementById("password").value;
    const erroCaixa = document.getElementById("login-error");

    if (usuarioDigitado === "Admin" && senhaDigitada === "Admin") {
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("main-dashboard").classList.remove("hidden");
        erroCaixa.classList.add("hidden");
        gerarIdOrdemServico();
    } else {
        erroCaixa.classList.remove("hidden");
    }
}

function handleLogout() {
    document.getElementById("main-dashboard").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

// Chaveador de Abas do Menu de Tecidos
function switchTab(tabId) {
    document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.add("hidden"));
    document.getElementById(tabId).classList.remove("hidden");

    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`btn-${tabId}`).classList.add("active");

    const nomenclaturaAbas = {
        "tab-clientes": "Cadastro de Clientes & Medidas",
        "tab-funcionarios": "Cadastrar Funcionários",
        "tab-os": "Ordens de Serviço e Confecção",
        "tab-reparos": "Ordens de Reparo e Serviço"
    };
    document.getElementById("page-title").innerText = nomenclaturaAbas[tabId];
}

function configurarDataSistema() {
    const hoje = new Date().toISOString().split('T')[0];
    const inputEntrada = document.getElementById("reparo-data-entrada");
    if(inputEntrada) inputEntrada.value = hoje;
}

// ================= 2. BANCO DE CLIENTES E MEDIDAS =================
function cadastrarCliente(event) {
    event.preventDefault();

    const novoCliente = {
        nome: document.getElementById("cli-nome").value,
        whatsapp: document.getElementById("cli-whatsapp").value,
        email: document.getElementById("cli-email").value,
        rua: document.getElementById("cli-rua").value,
        numero: document.getElementById("cli-numero").value,
        referencia: document.getElementById("cli-referencia").value,
        tamanho: document.getElementById("cli-tamanho").value,
        medidas: {
            pescoco: document.getElementById("m-pescoco").value || "—",
            torax: document.getElementById("m-torax").value || "—",
            busto: document.getElementById("m-alt-busto").value || "—"
        }
    };

    acervoClientes.push(novoCliente);
    renderizarTabelaClientes();
    document.getElementById("form-cliente").reset();
    alert("Prontuário de medidas do cliente armazenado no acervo MyBorderô!");
}

function renderizarTabelaClientes() {
    const tbody = document.getElementById("lista-clientes-body");
    if(acervoClientes.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5">Nenhum cliente catalogado na banca de corte.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    acervoClientes.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${c.nome}</strong></td>
            <td><span style="font-weight:500;">${c.whatsapp}</span><br><span style="color:var(--text-mutado); font-size:0.75rem;">${c.email}</span></td>
            <td>${c.rua}, casa ${c.numero}<br><span style="color:var(--ouro-velho); font-size:0.75rem; font-weight:500;">Ref: ${c.referencia}</span></td>
            <td><span class="badge-sit" style="background:var(--navy-linho); color:#fff;">${c.tamanho}</span></td>
            <td style="font-family:monospace; font-size:0.8rem; font-weight:600; color:var(--text-principal);">${c.medidas.pescoco} cm / ${c.medidas.torax} cm / ${c.medidas.busto} cm</td>
        `;
        tbody.appendChild(tr);
    });
}

// ================= 3. REGISTRO DE COLABORADORES =================
function cadastrarFuncionario(event) {
    event.preventDefault();
    alert("Colaborador registrado no quadro de funcionários do Atelier!");
    document.getElementById("form-funcionario").reset();
}

// ================= 4. MÓDULO ORDENS DE SERVIÇO (CÁLCULO AUTOMÁTICO COM INSUMOS) =================
function adicionarInsumo() {
    const itemNome = document.getElementById("insumo-nome").value;
    const itemCusto = parseFloat(document.getElementById("insumo-custo").value) || 0;

    if(!itemNome || itemCusto <= 0) return;

    roloInsumosCorrentes.push({ nome: itemNome, custo: itemCusto });
    document.getElementById("insumo-nome").value = "";
    document.getElementById("insumo-custo").value = "0.00";

    renderizarListaAviamentos();
    calcularTotalOS();
}

function renderizarListaAviamentos() {
    const containerUl = document.getElementById("os-lista-insumos");
    if (roloInsumosCorrentes.length === 0) {
        containerUl.innerHTML = `<li class="placeholder-item">Nenhum insumo ou aviamento indexado a esta peça.</li>`;
        return;
    }

    containerUl.innerHTML = "";
    roloInsumosCorrentes.forEach((ins, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${ins.nome} — <span style="color:var(--navy-linho); font-weight:600;">R$ ${ins.custo.toFixed(2)}</span></span>
            <button type="button" class="btn-remove" onclick="removerInsumoDoRolo(${idx})">&times;</button>
        `;
        containerUl.appendChild(li);
    });
}

function removerInsumoDoRolo(idx) {
    roloInsumosCorrentes.splice(idx, 1);
    renderizarListaAviamentos();
    calcularTotalOS();
}

function calcularTotalOS() {
    const valorMaoObra = parseFloat(document.getElementById("os-valor-servico").value) || 0;
    const somatorioInsumos = roloInsumosCorrentes.reduce((acc, item) => acc + item.custo, 0);
    const somatorioConsolidado = valorMaoObra + somatorioInsumos;

    document.getElementById("calc-subtotal-servico").innerText = `R$ ${valorMaoObra.toFixed(2)}`;
    document.getElementById("calc-subtotal-insumos").innerText = `R$ ${somatorioInsumos.toFixed(2)}`;
    document.getElementById("calc-total-final").innerText = `R$ ${somatorioConsolidado.toFixed(2)}`;
}

// ================= 5. SISTEMA PREDICTIVO DE REPAROS E STATUS DE ESPERA =================
function gerarIdOrdemServico() {
    const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("reparo-generated-id").innerText = `OS-${numeroAleatorio}`;
}

function filtrarClientesDropdown() {
    const digitado = document.getElementById("reparo-busca-cliente").value.toLowerCase();
    const painelDropdown = document.getElementById("reparo-dropdown-resultados");

    if (!digitado) {
        painelDropdown.classList.add("hidden");
        return;
    }

    const filtrados = acervoClientes.filter(c => c.nome.toLowerCase().includes(digitado));

    if (filtrados.length === 0) {
        painelDropdown.innerHTML = `<div class="dropdown-item" style="color:var(--text-mutado); font-style:italic;">Nenhum cliente compatível localizado</div>`;
    } else {
        painelDropdown.innerHTML = "";
        filtrados.forEach(c => {
            const caixaOpcao = document.createElement("div");
            caixaOpcao.className = "dropdown-item";
            caixaOpcao.innerText = c.nome;
            caixaOpcao.onclick = () => fixarClienteNaOrdem(c.nome);
            painelDropdown.appendChild(caixaOpcao);
        });
    }
    painelDropdown.classList.remove("hidden");
}

function fixarClienteNaOrdem(nomeCliente) {
    clienteVinculadoOrdem = nomeCliente;
    document.getElementById("reparo-nome-cliente-confirmado").innerText = nomeCliente;
    document.getElementById("reparo-cliente-selecionado-badge").classList.remove("hidden");
    document.getElementById("reparo-busca-cliente").value = "";
    document.getElementById("reparo-dropdown-resultados").classList.add("hidden");
}

function desvincularClienteReparo() {
    clienteVinculadoOrdem = null;
    document.getElementById("reparo-cliente-selecionado-badge").classList.add("hidden");
}

function emitirOrdemReparo(event) {
    event.preventDefault();

    if (!clienteVinculadoOrdem) {
        alert("Atenção: É mandatório selecionar um cliente válido através do campo predictivo antes de salvar.");
        return;
    }

    const fichaOrdem = {
        id: document.getElementById("reparo-generated-id").innerText,
        cliente: clienteVinculadoOrdem,
        servico: document.getElementById("reparo-tipo").value,
        valor: parseFloat(document.getElementById("reparo-valor").value) || 0,
        entrada: document.getElementById("reparo-data-entrada").value,
        prazo: document.getElementById("reparo-data-prazo").value,
        situacao: "Pronto para Retirada",
        baixaInfo: null
    };

    acervoReparos.push(fichaOrdem);
    renderizarTabelaVaralReparos();
    document.getElementById("form-reparo").reset();
    desvincularClienteReparo();
    gerarIdOrdemServico();
    configurarDataSistema();
}

function calcularTempoEsperaNoAtelier(reparoItem) {
    if (reparoItem.situacao === "Baixado / Entregue") return "Entregue";

    const hojeData = new Date();
    hojeData.setHours(0,0,0,0);
    const prazoObjeto = new Date(reparoItem.prazo + "T00:00:00");

    if (hojeData > prazoObjeto) {
        const deltaMilissegundos = hojeData.getTime() - prazoObjeto.getTime();
        const deltaDias = Math.floor(deltaMilissegundos / (1000 * 60 * 60 * 24));
        return deltaDias === 0 ? "Prazo vence no dia de hoje" : `Aguardando retirada há ${deltaDias} dia(s)`;
    }
    return "Aguardando dentro do prazo";
}

function executarBaixaPeca(posicaoIndex) {
    acervoReparos[posicaoIndex].situacao = "Baixado / Entregue";
    acervoReparos[posicaoIndex].baixaInfo = new Date().toLocaleDateString('pt-BR');
    renderizarTabelaVaralReparos();
}

function renderizarTabelaVaralReparos() {
    const tbody = document.getElementById("lista-reparos-body");
    if (acervoReparos.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Nenhuma peça em monitoramento no varal de reparos.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    acervoReparos.forEach((rep, idx) => {
        const tr = document.createElement("tr");
        const resolvido = rep.situacao === "Baixado / Entregue";
        const cssStatus = resolvido ? "badge-sit entregue" : "badge-sit pronto";
        const txtEspera = calcularTempoEsperaNoAtelier(rep);

        tr.innerHTML = `
            <td style="font-family:monospace; font-weight:700; color:var(--navy-linho);">${rep.id}</td>
            <td><strong>${rep.cliente}</strong></td>
            <td>${rep.servico}</td>
            <td style="font-size:0.8rem; line-height:1.4;">
                Entrada: ${new Date(rep.entrada + "T00:00:00").toLocaleDateString('pt-BR')}<br>
                Prazo: <span style="font-weight:700; color:var(--ouro-velho);">${new Date(rep.prazo + "T00:00:00").toLocaleDateString('pt-BR')}</span>
            </td>
            <td><strong>R$ ${rep.valor.toFixed(2)}</strong></td>
            <td><span class="${cssStatus}">${rep.situacao}</span></td>
            <td style="font-size:0.8rem; font-weight:600; color:${txtEspera.includes('há') ? 'var(--safetymode-red)' : 'var(--text-mutado)'}">${txtEspera}</td>
            <td>
                ${resolvido ? 
                    `<span style="font-size:0.75rem; color:var(--safetymode-green); font-weight:600;">Retirado em: ${rep.baixaInfo}</span>` : 
                    `<button class="btn-baixa" onclick="executarBaixaPeca(${idx})">Dar Baixa</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}