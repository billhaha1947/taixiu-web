const API_URL = window.location.origin;
const btn = document.getElementById("loginBtn");
const pass = document.getElementById("password");
const status = document.getElementById("status");

btn.addEventListener("click", async () => {
  const password = pass.value.trim();
  if (!password) return (status.textContent = "⚠️ Vui lòng nhập mật khẩu");

  status.textContent = "⏳ Đang kiểm tra...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("adminAuth", "true");
      window.location.href = "/admin.html";
    } else {
      status.textContent = data.message || "❌ Sai mật khẩu!";
    }
  } catch (err) {
    status.textContent = "⚠️ Lỗi kết nối server!";
  }

  btn.disabled = false;
});
