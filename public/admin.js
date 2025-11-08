document.getElementById("updateBalance").onclick = () => {
  const user = document.getElementById("userId").value.trim();
  const money = Number(document.getElementById("newBalance").value);

  if (!user || isNaN(money)) return alert("Nhập ID và số dư hợp lệ!");

  fetch("/api/admin/updateBalance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, money }),
  })
  .then(res => res.json())
  .then(data => alert(data.message || "Cập nhật thành công"))
  .catch(() => alert("Lỗi máy chủ"));
};
