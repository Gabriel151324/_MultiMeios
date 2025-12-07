const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Caminho do CSV
const FILE_PATH = "./livros.csv";

// Convert CSV → Array de objetos
function csvToJson(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines.shift().split(",");
  return lines.map(linha => {
    const values = linha.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    return obj;
  });
}

// GET → Lista os livros
app.get("/livros", (req, res) => {
  if (!fs.existsSync(FILE_PATH)) return res.json([]);

  const csv = fs.readFileSync(FILE_PATH, "utf8");
  res.json(csvToJson(csv));
});

// POST → Adiciona um livro
app.post("/livros", (req, res) => {
  const { titulo, autor, ano } = req.body;

  const novaLinha = `${titulo},${autor},${ano}\n`;

  // Se o arquivo não existe, cria com cabeçalho
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, "titulo,autor,ano\n");
  }

  fs.appendFileSync(FILE_PATH, novaLinha);

  const csv = fs.readFileSync(FILE_PATH, "utf8");
  res.json(csvToJson(csv)); // retorna lista atualizada
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
