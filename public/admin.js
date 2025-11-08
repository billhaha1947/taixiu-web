const API_URL = window.location.origin;
const btn = document.getElementById("clearBtn");
const status = document.getElementById("status");
const logoutBtn = document.getElementById("logoutBtn");

// ✅ kiểm tra đăng nhập
if (!localStorage.getItem("adminAuth")) {
  window.location.href = "/login.html";
}

btn.addEventListener("click", async () => {
  if (!confirm("Bạn chắc chắn muốn xóa toàn bộ lịch sử?")) return;
  btn.disabled = true;
  status.textContent = "Đang xóa...";
  try {
    const res = await fetch(`${API_URL}/admin/clear`);
    const data = await res.json();
    status.textContent = data.message;
  } catch {
    status.textContent = "Lỗi khi xóa dữ liệu!";
  }
  btn.disabled = false;
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminAuth");
  window.location.href = "/login.html";
});
