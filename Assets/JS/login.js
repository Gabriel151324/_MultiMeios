document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const user = document.getElementById("login-username").value;
    const pass = document.getElementById("login-password").value;

    const response = await fetch("https://api-multimeios.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = "/Assets/Dashboard.html";
    } else {
      alert("Credenciais inválidas.");
    }
  });
