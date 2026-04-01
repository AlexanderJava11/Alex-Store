document.addEventListener("DOMContentLoaded", () => {
  const customerForm = document.getElementById("customerLoginForm");
  const adminForm = document.getElementById("adminLoginForm");

  customerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("customerName").value.trim();
    if (name.length < 2 || name.length > 30) {
      showAlert("customerMsg", "danger", "Namnet måste vara mellan 2 och 30 tecken.");
      return;
    }
    setUser(name, "customer");
    showAlert("customerMsg", "success", "Inloggning lyckades.");
    setTimeout(() => window.location.href = "index.html", 500);
  });

  adminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value.trim();
    if (username === "admin" && password === "1234") {
      setUser("Admin", "admin");
      showAlert("adminMsg", "success", "Admin inloggad.");
      setTimeout(() => window.location.href = "admin.html", 500);
    } else {
      showAlert("adminMsg", "danger", "Fel användarnamn eller lösenord.");
    }
  });
});
