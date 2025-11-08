const API_URL = window.location.origin;
const btn = document.getElementById("clearBtn");
const status = document.getElementById("status");

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
