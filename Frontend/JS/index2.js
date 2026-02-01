// ===== ESTADO GLOBAL =====
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

// ===== API =====
const API_BASE = "https://api-multimeios.onrender.com";

// ===== LIVROS (API) =====
async function carregarLivrosAPI() {
  try {
    const res = await fetch(`${API_BASE}/livro/get`);
    livros = await res.json();
    atualizarListas();
  } catch (e) {
    console.error("Erro ao carregar livros:", e);
    alert("Erro ao carregar livros da API");
  }
}

// ===== LISTAGENS =====
let qtdVisivel = 5;

function listarLivrosFront() {
  const listaPainel = document.getElementById("listaLivrosPainel");
  const listaCadastro = document.getElementById("listaLivrosCadastro");
  const btnVerMais = document.getElementById("verMaisBtn");

  if (!livros.length) {
    listaPainel.innerHTML = "<li>Nenhum livro cadastrado.</li>";
    listaCadastro.innerHTML = "<li>Nenhum livro cadastrado.</li>";
    btnVerMais.style.display = "none";
    return;
  }

  const visiveis = livros.slice(0, qtdVisivel);

  listaPainel.innerHTML = visiveis
    .map(
      (l) =>
        `<li><strong>${l.LIVRO}</strong> — ${l.AUTOR} (${l.ANO || "-"})</li>`,
    )
    .join("");

  listaCadastro.innerHTML = livros
    .map(
      (l) =>
        `<li><strong>${l.LIVRO}</strong> — ${l.AUTOR} (${l.ANO || "-"})</li>`,
    )
    .join("");

  btnVerMais.style.display =
    qtdVisivel < livros.length ? "block" : "none";
}

function mostrarMaisLivros() {
  qtdVisivel += 5;
  listarLivrosFront();
}

// ===== DASHBOARD =====
function atualizarDashboard() {
  document.getElementById("totalLivrosDashboard").textContent = livros.length;
  document.getElementById("totalReservasDashboard").textContent =
    reservas.length;
  document.getElementById("totalNotificacoesDashboard").textContent =
    notificacoes.length;
}

function atualizarListas() {
  qtdVisivel = 5;
  listarLivrosFront();
  atualizarDashboard();

  document.getElementById("notificacoesContainer").innerHTML =
    notificacoes.map((n) => `<div class="notify">${n}</div>`).join("");
}

// ===== CADASTRAR LIVRO (API) =====
async function adicionarLivro() {
  try {
    const dados = {
      ID: document.getElementById("id").value,
      AUTOR: document.getElementById("autor").value,
      LIVRO: document.getElementById("livro").value,
      ANO: document.getElementById("ano").value || "",
    };

    const res = await fetch(`${API_BASE}/livro/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!res.ok) throw new Error("Erro ao cadastrar");

    alert("Livro cadastrado com sucesso!");
    document.getElementById("formCadastro").reset();
    carregarLivrosAPI();
  } catch (e) {
    console.error(e);
    alert("Erro ao cadastrar livro");
  }
}

// ===== BUSCAR POR ID =====
async function buscarLivroPorId() {
  const ID = document.getElementById("buscarLivroInput").value;
  if (!ID) return alert("Digite um ID");

  try {
    const res = await fetch(`${API_BASE}/livro/get/${ID}`);
    if (!res.ok) return alert("Livro não encontrado");

    const livro = await res.json();
    preencherFormulario(livro);
  } catch (e) {
    alert("Erro ao buscar livro");
  }
}

function preencherFormulario(l) {
  document.getElementById("livro").value = l.LIVRO || "";
  document.getElementById("autor").value = l.AUTOR || "";
  document.getElementById("ano").value = l.ANO || "";
}

// ===== NOTIFICAÇÕES =====
function notificacao(msg) {
  notificacoes.unshift(msg);
  atualizarListas();
}

// ===== DARK MODE =====
const darkToggle = document.getElementById("modoEscuro");
darkToggle.checked = localStorage.getItem("darkMode") === "true";

if (darkToggle.checked) document.body.classList.add("dark");

darkToggle.addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
  localStorage.setItem("darkMode", e.target.checked);
});

// ===== INIT =====
carregarLivrosAPI();
