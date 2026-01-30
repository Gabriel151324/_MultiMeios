// ===== VARIÁVEIS GLOBAIS =====
let livros = [];
let reservas = [];
let notificacoes = [];

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

    atualizarListas();
  });
});

// ===== FUNÇÕES CSV (Livros) =====
async function carregarLivrosCSV() {
  try {
    const resp = await fetch("/_MultiMeios/Backend/livros.csv");
    const texto = await resp.text();

    livros = texto
      .split("\n")
      .slice(1)
      .map((l) => l.split(","))
      .filter((c) => c.length >= 6)
      .map((c) => ({
        titulo: c[0],
        autor: c[1],
        ano: c[2],
        isbn: c[3],
        categoria: c[4],
        quantidade: c[5],
      }));

    atualizarListas();
  } catch (e) {
    console.error("Erro ao carregar CSV:", e);
  }
}

// ===== LISTAGENS =====
let qtdVisivel = 5; // quantos livros aparecem por vez

function listarLivrosFront() {
  const listaPainel = document.getElementById("listaLivrosPainel");
  const listaCadastro = document.getElementById("listaLivrosCadastro");
  const btnVerMais = document.getElementById("verMaisBtn");

  if (!livros.length) {
    listaCadastro.innerHTML = "<li>Nenhum livro cadastrado ainda.</li>";
    listaPainel.innerHTML = "<li>Nenhum livro cadastrado ainda.</li>";
    btnVerMais.style.display = "none";
    return;
  }

  // 🔥 Só os visíveis
  const visiveis = livros.slice(0, qtdVisivel);

  const htmlVisivel = visiveis
    .map(
      (l) =>
        `<li><strong>${l.titulo}</strong> — ${l.autor} (${l.categoria})</li>`,
    )
    .join("");

  // Cadastro sempre mostra tudo
  const htmlCadastro = livros
    .map(
      (l) =>
        `<li><strong>${l.titulo}</strong> — ${l.autor} (${l.categoria})</li>`,
    )
    .join("");

  listaCadastro.innerHTML = htmlCadastro;
  listaPainel.innerHTML = htmlVisivel;

  // Se ainda tem livro escondido → mostra botão
  if (qtdVisivel < livros.length) {
    btnVerMais.style.display = "block";
  } else {
    btnVerMais.style.display = "none";
  }
}

function mostrarMaisLivros() {
  qtdVisivel += 5; // adiciona +5 livros
  listarLivrosFront();
}

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

  const container = document.getElementById("notificacoesContainer");
  container.innerHTML = notificacoes
    .map((msg) => `<div class="notify">${msg}</div>`)
    .join("");
}

// ===== BACKEND (opcional) =====
async function carregarLivros() {
  const res = await fetch("http://localhost:3000/livros");
  livros = await res.json();
  mostrarLivros(livros);
}

function mostrarLivros(lista) {
  const div = document.getElementById("lista-livros");
  div.innerHTML = "";

  lista.forEach((l) => {
    div.innerHTML += `
        <div class="livro-item">
          <strong>${l.titulo}</strong><br>
          Autor: ${l.autor}<br>
          Ano: ${l.ano}
        </div>
        <hr>
        `;
  });
}

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
function alugarLivro(e) {
  e.preventDefault();

  const aluno = document.getElementById("nomeAlunoAlugar").value.trim();
  const livro = document.getElementById("tituloReservaAlugar").value.trim();
  const data = document.getElementById("dataReservaAlugar").value;

  if (!aluno || !livro || !data) return alert("Preencha todos os campos!");

  reservas.push({ aluno, livro, data });
  notificacao(`📅 ${aluno} alugou o livro "${livro}".`);

  e.target.reset();
  atualizarListas();
}

function removerReserva(i) {
  if (!confirm("Cancelar esta reserva?")) return;
  reservas.splice(i, 1);
  notificacao("❌ Reserva cancelada.");
  atualizarListas();
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
      console.log("Livro encontrado:", livro);

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

// ===== INITIAL LOAD =====
carregarLivrosCSV(); // só CSV inicial
