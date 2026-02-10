// ===== VARIÁVEIS GLOBAIS =====
let livros = [];
let reservas = [];
const notificacoes = [];

// ===== MENU & SIDEBAR =====
const toggleDropdown = (dropdown, menu, isOpen) => {
  dropdown.classList.toggle("open", isOpen);
  menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
};

const closeAllDropdowns = () =>
  document
    .querySelectorAll(".dropdown-container.open")
    .forEach((d) =>
      toggleDropdown(d, d.querySelector(".dropdown-menu"), false),
    );

document.querySelectorAll(".dropdown-toggle").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const dropdown = btn.closest(".dropdown-container");
    const menu = dropdown.querySelector(".dropdown-menu");
    const isOpen = dropdown.classList.contains("open");

    closeAllDropdowns();
    toggleDropdown(dropdown, menu, !isOpen);
  });
});

document
  .querySelectorAll(".sidebar-toggler, .sidebar-menu-button")
  .forEach((btn) =>
    btn.addEventListener("click", () => {
      closeAllDropdowns();
      document.querySelector(".sidebar").classList.toggle("collapsed");
    }),
  );

if (window.innerWidth <= 1024)
  document.querySelector(".sidebar").classList.add("collapsed");

// ===== TROCA DE TELAS =====
const sections = document.querySelectorAll("main section");

document.querySelectorAll("[data-target]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.target;

    sections.forEach((sec) => sec.classList.remove("active"));
    document.getElementById(target).classList.add("active");

    if (target === "devolver-livro") {
      listaAlugueis();
    }

    atualizarListas();
  });
});

// ===== LISTAGENS =====
function listarReservasFront() {
  const html = reservas.length
    ? reservas
        .map(
          (r, i) =>
            `<li>
          <span><strong>${r.livro}</strong> alugado por ${r.aluno} em ${new Date(r.data).toLocaleDateString()}</span>
          <button class="delete-btn" onclick="removerReserva(${i})">Cancelar</button>
        </li>`,
        )
        .join("")
    : "<li>Nenhum aluguel ainda.</li>";

  document.getElementById("listaAluguelSecao").innerHTML = html;
  document.getElementById("listaReservasPainel").innerHTML = html;
}

function atualizarDashboard() {
  document.getElementById("totalLivrosDashboard").textContent = livros.length;
  document.getElementById("totalReservasDashboard").textContent =
    reservas.length;
  document.getElementById("totalNotificacoesDashboard").textContent =
    notificacoes.length;
}

function atualizarListas() {
  // resetar quantidade visível ao atualizar
  qtdVisivel = 5;

  listarLivrosFront();
  listarReservasFront();
  atualizarDashboard();
}

// ===== FUNÇÕES DE LIVROS =====
async function adicionarLivro() {
  try {
    // Captura os valores do HTML
    // Certifica-te que os IDs no getElementById batem com o teu HTML
    const idValue = document.getElementById("id").value;
    const autorValue = document.getElementById("autor").value;
    const livroValue = document.getElementById("livro").value;
    const estanteValue = document.getElementById("estante").value;
    const volumeValue = document.getElementById("volume").value;
    const exemplarValue = document.getElementById("exemplares").value;
    const cidadeValue = document.getElementById("cidade").value;
    const editoraValue = document.getElementById("editora").value;
    const anoValue = document.getElementById("ano").value;
    const origemValue = document.getElementById("origem").value;
    const codigoValue = document.getElementById("codigo").value;
    const dataValue = document.getElementById("dados").value;
    const adaptadoValue = document.getElementById("AdaptadoPor").value;

    // Monta o objeto exatamente como a API exige
    const dadosParaEnviar = {
      ID: String(idValue),
      AUTOR: autorValue,
      LIVRO: livroValue,
      ESTANTE: estanteValue,
      VOLUME: volumeValue || "",
      EXEMPLAR: exemplarValue || "",
      CIDADE: cidadeValue || "",
      EDITORA: editoraValue || "",
      ANO: anoValue || "",
      ORIGEM: origemValue || "",
      CÓDIGO: codigoValue || "",
      DATA: dataValue || "",
      "ADAPTADO POR": adaptadoValue || "",
    };

    console.log("Enviando dados:", dadosParaEnviar);

    // Faz a requisição
    const res = await fetch("https://api-multimeios.onrender.com/livro/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosParaEnviar),
    });

    if (res.ok) {
      alert("Livro cadastrado com sucesso!");
      atualizarTotalLivrosDashboard();
      document.getElementById("formCadastro").reset();
    } else {
      const erroServidor = await res.text();
      console.error("Resposta de erro da API:", erroServidor);
      alert("A API recusou os dados. Verifica a consola.");
    }
  } catch (error) {
    console.error("Erro de conexão (CORS ou Rede):", error);
    alert("Falha ao conectar com a API externa.");
  }
}

// ===== NOTIFICAÇÕES =====
function notificacao(msg) {
  notificacoes.unshift(msg);
  atualizarListas();
}

// ===== RESERVAR =====
function reservarLivro(e) {
  e.preventDefault();

  const aluno = document.getElementById("nomeAlunoRes").value.trim();
  const livro = document.getElementById("tituloReservaRes").value.trim();
  const data = document.getElementById("dataReservaRes").value;

  if (!aluno || !livro || !data) return alert("Preencha todos os campos!");

  reservas.push({ aluno, livro, data });
  notificacao(`📌 ${aluno} reservou o livro "${livro}".`);

  e.target.reset();
  atualizarListas();
}

// ===== ALUGAR =====
async function alugarLivro(event) {
  event.preventDefault(); // impede reload do form

  const ALUGADO = "";
  const nomeAluno = document.getElementById("nomeAlunoAlugar").value;
  const idLivro = document.getElementById("idLivro").value;
  const dataAluguel = document.getElementById("dataReservaAlugar").value;

  // payload no formato JSON
  const aluguel = {
    ALUNO: nomeAluno,
    DATA_ALUGUEL: dataAluguel,
    ALUGADO: "SIM",
  };

  try {
    const response = await fetch(
      `https://api-multimeios.onrender.com/livro/alugar/${idLivro}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aluguel),
      },
    );

    if (!response.ok) {
      throw new Error("Erro ao registrar aluguel");
    }

    const data = await response.json();

    alert("📚 Aluguel registrado com sucesso!");

    // limpa o form
    document.getElementById("formAlugar").reset();
  } catch (error) {
    console.error(error);
    alert("❌ Não foi possível registrar o aluguel");
  }
}

function removerReserva(i) {
  if (!confirm("Cancelar esta reserva?")) return;
  reservas.splice(i, 1);
  notificacao("❌ Reserva cancelada.");
  atualizarListas();
}

async function listaAlugueis() {
  const endpoint = "https://api-multimeios.onrender.com/livros/alugados";

  const contentor = document.getElementById("listaAluguelSecao");

  const painelAntigo = document.getElementById("listaLivrosPainel");
  if (painelAntigo) painelAntigo.innerHTML = "";

  try {
    const resposta = await fetch(endpoint);
    const dados = await resposta.json();
    const listaFinal = dados.livros_alugados || [];

    contentor.innerHTML = "";

    if (listaFinal.length === 0) {
      contentor.innerHTML =
        "<li class='sem-alugueis'>Nenhum aluguer registado para devolução.</li>";
      return;
    }

    listaFinal.forEach((livro) => {
      const item = document.createElement("li");

      item.innerHTML = `
        <div style="
.btn-devolver {
  width: 150px; 
  padding: 10px;
  cursor: pointer;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background 0.3s;
  text-align: center;
}

.btn-devolver:hover {
  background-color: #c0392b;
}


.item-aluguel {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  min-width: 400px; 
  background: #fff;
  border: 1px solid #ddd;
  margin-bottom: 8px;
  padding: 15px;
  border-radius: 8px;
}">
          <div>
            <strong>${livro.LIVRO}</strong><br>
            <small>Aluno: ${livro.ALUNO} | Id: ${livro.ID} | Ano: ${livro.ANO}</small>
          </div>
          <button class="btn-devolver" onclick="devolverLivro('${livro.ID}')">
            Confirmar Devolução
          </button>
        </div>
      `;

      contentor.appendChild(item);
    });
  } catch (erro) {
    console.error("Erro:", erro);
    contentor.innerHTML = "<li>Erro ao carregar os alugueres.</li>";
  }
}
window.onload = listaAlugueis;

async function devolverLivro(id_item) {
  const endpoint = `https://api-multimeios.onrender.com/livro/devolver/${id_item}`;

  try {
    const resposta = await fetch(endpoint, {
      method: "POST",

      body: new URLSearchParams({
        ALUGADO: "não",
        ALUNO: "",
        "DATA ALUGUEL": "",
        "DATA ENTREGA": "",
      }),
    });

    if (resposta.ok) {
      alert("✅ Livro devolvido!");
      listaAlugueis();
    } else {
      console.error("Erro na resposta:", resposta.status);
      alert("Erro ao devolver. O servidor respondeu com erro.");
    }
  } catch (erro) {
    console.error("Falha na devolução:", erro);
    alert("Erro de conexão (CORS ou Rede).");
  }
}

// ===== BUSCAR =====
async function buscarLivroPorId() {
  // Obtemos o ID
  const ID = document.getElementById("buscarLivroInput").value;

  // Validação simples: se o ID estiver vazio, não fazemos a requisição
  if (!ID) {
    alert("Por favor, digite um ID para procurar.");
    return;
  }

  try {
    // Fazemos o GET. O URL agora inclui o ID dinamicamente
    const res = await fetch(
      `https://api-multimeios.onrender.com/livro/get/${ID}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    // Verificamos se o livro foi encontrado
    if (res.ok) {
      const livro = await res.json();
      mostrarLivroNoFront(livro);

      // Chamamos uma função para preencher os campos do formulário com os dados
      preencherFormulario(livro);
    } else if (res.status === 404) {
      alert("Livro não encontrado!");
    } else {
      throw new Error("Erro ao procurar o livro.");
    }
  } catch (error) {
    console.error("Erro na requisição GET:", error);
    alert(
      "Erro ao conectar com o servidor Flask. Verifique se o CORS está ativo!",
    );
  }
}

// Função auxiliar para mostrar o livro na tela
function mostrarLivroNoFront(livro) {
  const lista = document.getElementById("listaLivrosPainel");

  lista.innerHTML = `
    <li>
      <strong>${livro.LIVRO}</strong><br>
      Autor: ${livro.AUTOR || "-"}<br>
      Ano: ${livro.ANO || "-"}<br>
      Código: ${livro.ID}
    </li>
  `;
}

// mostrar livro no front
async function carregarTotalLivros() {
  try {
    const response = await fetch("https://api-multimeios.onrender.com/");
    const data = await response.json();

    const tamanho = data.length;

    document.getElementById("totalLivrosDashboard").innerText = tamanho;
  } catch (error) {
    console.error("Erro ao buscar total de livros:", error);
    document.getElementById("totalLivrosDashboard").innerText = "!";
  }
}

// chama ao abrir o dashboard
carregarTotalLivros();

// Função auxiliar para colocar os dados de volta nos inputs
function preencherFormulario(dados) {
  // Ajusta os nomes das chaves (LIVRO, AUTOR) conforme a resposta da tua API
  document.getElementById("livro").value = dados.LIVRO || "";
  document.getElementById("autor").value = dados.AUTOR || "";
  document.getElementById("ano").value = dados.ANO || "";
  // Adiciona os outros campos conforme necessário...
}

// ===== FORMULÁRIOS =====
document
  .getElementById("formReservar")
  .addEventListener("submit", reservarLivro);
document.getElementById("formAlugar").addEventListener("submit", alugarLivro);

// ===== DARK MODE =====
const darkToggle = document.getElementById("modoEscuro");
darkToggle.checked = localStorage.getItem("darkMode") === "true";

if (darkToggle.checked) document.body.classList.add("dark");

darkToggle.addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
  localStorage.setItem("darkMode", e.target.checked);
});

// ===== EXPORTAR =====
document.getElementById("exportar").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ livros, reservas, notificacoes })], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup_multimeios.json";
  a.click();
  URL.revokeObjectURL(url);
});

// ===== IMPORTAR =====
const importarArquivo = document.getElementById("importarArquivo");
document
  .getElementById("importar")
  .addEventListener("click", () => importarArquivo.click());

importarArquivo.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      livros = dados.livros || [];
      reservas = dados.reservas || [];
      notificacoes = dados.notificacoes || [];

      atualizarListas();
      alert("Backup importado com sucesso!");
    } catch {
      alert("Erro ao importar backup!");
    }
  };

  reader.readAsText(file);
});

// ===== LIMPAR =====
document.getElementById("limparTudo").addEventListener("click", () => {
  if (!confirm("Tem certeza que deseja limpar todos os dados?")) return;

  livros = [];
  reservas = [];
  notificacoes = [];

  atualizarListas();
  alert("Todos os dados foram limpos!");
});
