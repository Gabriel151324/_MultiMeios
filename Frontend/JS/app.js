const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// ======== MENU E TROCA DE TELAS ========
const toggleDropdown = (dropdown, menu, isOpen) => {
  dropdown.classList.toggle("open", isOpen);
  menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
};

const closeAllDropdowns = () => {
  document
    .querySelectorAll(".dropdown-container.open")
    .forEach((d) =>
      toggleDropdown(d, d.querySelector(".dropdown-menu"), false)
    );
};

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
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllDropdowns();
      document.querySelector(".sidebar").classList.toggle("collapsed");
    });
  });

if (window.innerWidth <= 1024)
  document.querySelector(".sidebar").classList.add("collapsed");

const sections = document.querySelectorAll("main section");
document.querySelectorAll("[data-target]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.target;
    sections.forEach((sec) => sec.classList.remove("active"));
    document.getElementById(target).classList.add("active");
    if (target === "cad-livro") listarLivros();
    if (target === "alugar-livro") listarReservas();
    if (target === "res-livro") listarReservas();
    if (target === "painel") atualizarDashboard();
  });
});

const API = "http://localhost:3000";

// ======== FUNÇÕES DE LIVROS ========
async function listarLivros() {
  const res = await fetch(`${API}/livros`);
  const livros = await res.json();
  const listaCadastro = document.getElementById("listaLivrosCadastro");
  const listaPainel = document.getElementById("listaLivrosPainel");

  const html = livros.length
    ? livros
        .map(
          (l) => `
        <li>
          <span><strong>${l.titulo}</strong> — ${l.autor} (${l.categoria})</span>
          <button class="delete-btn" onclick="removerLivro(${l.id})">Excluir</button>
        </li>`
        )
        .join("")
    : "<li>Nenhum livro cadastrado ainda.</li>";

  listaCadastro.innerHTML = html;
  listaPainel.innerHTML = html;
  atualizarDashboard(livros.length, null);
}

async function cadastrarLivro(e) {
  e.preventDefault();
  const titulo = tituloLivro.value.trim();
  const autor = autorLivro.value.trim();
  const categoria = categoriaLivro.value;
  if (!titulo || !autor || !categoria)
    return alert("Preencha todos os campos!");

  await fetch(`${API}/livros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo, autor, categoria }),
  });

  notificacao(`📘 Novo livro "${titulo}" cadastrado.`);
  e.target.reset();
  listarLivros();
}

async function removerLivro(id) {
  if (!confirm("Excluir este livro?")) return;
  await fetch(`${API}/livros/${id}`, { method: "DELETE" });
  notificacao(`❌ Livro removido.`);
  listarLivros();
}

// ======== BUSCAR LIVROS NO PAINEL ========
async function buscarLivrosPainel() {
  const termo = document
    .getElementById("buscarLivroInput")
    .value.trim()
    .toLowerCase();
  const res = await fetch(`${API}/livros`);
  const livros = await res.json();

  // Filtra os livros de acordo com o termo
  const filtrados = livros.filter(
    (l) =>
      l.titulo.toLowerCase().includes(termo) ||
      l.autor.toLowerCase().includes(termo) ||
      l.categoria.toLowerCase().includes(termo)
  );

  const listaPainel = document.getElementById("listaLivrosPainel");
  listaPainel.innerHTML = filtrados.length
    ? filtrados
        .map(
          (l) => `
        <li>
          <span><strong>${l.titulo}</strong> — ${l.autor} (${l.categoria})</span>
          <button class="delete-btn" onclick="removerLivro(${l.id})">Excluir</button>
        </li>
      `
        )
        .join("")
    : "<li>Nenhum livro encontrado.</li>";
}

// ======== FUNÇÕES DE RESERVAS ========
async function listarReservas() {
  const res = await fetch(`${API}/reservas`);
  const reservas = await res.json();
  const listaSecao = document.getElementById("listaReservasSecao");
  const listaPainel = document.getElementById("listaReservasPainel");

  const html = reservas.length
    ? reservas
        .map(
          (r) => `
        <li>
          <span><strong>${r.livro}</strong> por ${r.aluno} em ${new Date(
            r.data
          ).toLocaleDateString()}</span>
          <button class="delete-btn" onclick="removerReserva(${
            r.id
          })">Cancelar</button>
        </li>`
        )
        .join("")
    : "<li>Nenhuma reserva ainda.</li>";

  listaSecao.innerHTML = html;
  listaPainel.innerHTML = html;
  atualizarDashboard(null, reservas.length);
}

async function reservarLivro(e) {
  e.preventDefault();
  const aluno = nomeAlunoRes.value.trim();
  const livro = tituloReservaRes.value.trim();
  const data = dataReservaRes.value;
  if (!aluno || !livro || !data) return alert("Preencha todos os campos!");

  await fetch(`${API}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aluno, livro, data }),
  });

  notificacao(`📌 ${aluno} reservou o livro "${livro}".`);
  e.target.reset();
  listarReservas();
}

async function alugarLivro(e) {
  e.preventDefault();
  const aluno = nomeAlunoAlugar.value.trim();
  const livro = tituloReservaAlugar.value.trim();
  const data = dataReservaAlugar.value;
  if (!aluno || !livro || !data) return alert("Preencha todos os campos!");

  await fetch(`${API}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aluno, livro, data }),
  });

  notificacao(`📅 ${aluno} alugou o livro "${livro}".`);
  e.target.reset();
  listarReservas();
}

async function removerReserva(id) {
  if (!confirm("Cancelar esta reserva?")) return;
  await fetch(`${API}/reservas/${id}`, { method: "DELETE" });
  notificacao(`❌ Reserva cancelada.`);
  listarReservas();
}

// ======== DASHBOARD ========
async function atualizarDashboard(totalLivros = null, totalReservas = null) {
  const livrosRes =
    totalLivros ?? (await (await fetch(`${API}/livros`)).json()).length;
  const reservasRes =
    totalReservas ?? (await (await fetch(`${API}/reservas`)).json()).length;
  document.getElementById("totalLivrosDashboard").textContent = livrosRes;
  document.getElementById("totalReservasDashboard").textContent = reservasRes;
}

// ======== NOTIFICAÇÕES ========
const notificacoesContainer = document.getElementById("notificacoesContainer");
function notificacao(msg) {
  const div = document.createElement("div");
  div.className = "notify";
  div.textContent = msg;
  notificacoesContainer.prepend(div);
}

// ======== EVENTOS ========
document
  .getElementById("formCadastro")
  .addEventListener("submit", cadastrarLivro);
document
  .getElementById("formReservar")
  .addEventListener("submit", reservarLivro);
document.getElementById("formAlugar").addEventListener("submit", alugarLivro);

// ======== MODO ESCURO ========
document.getElementById("modoEscuro").addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
  localStorage.setItem("darkMode", e.target.checked);
});
if (localStorage.getItem("darkMode") === "true")
  document.body.classList.add("dark");

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

document
  .getElementById("importar")
  .addEventListener("click", () => importarArquivo.click());
document.getElementById("importarArquivo").addEventListener("change", (e) => {
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

document.getElementById("limparTudo").addEventListener("click", () => {
  if (confirm("Tem certeza que deseja limpar todos os dados?")) {
    livros = [];
    reservas = [];
    notificacoes = [];
    atualizarListas();
    alert("Todos os dados foram limpos!");
  }
});
atualizarListas();

// ======== INICIAL ========
listarLivros();
listarReservas();
