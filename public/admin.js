// public/admin.js
const loadBtn = document.getElementById("loadUsers");
const userList = document.getElementById("userList");

loadBtn.addEventListener("click", async () => {
  const secret = prompt("Admin secret?");
  const res = await fetch("/api/admin/users", {
    headers: { "x-admin-secret": secret }
  });
  const j = await res.json();
  userList.innerHTML = "";
  if (j.error) return alert(j.error);
  j.forEach(u => {
    const li = document.createElement("li");
    li.innerText = `${u.id} - ${u.email || ""} - ${u.balance || 0}`;
    userList.appendChild(li);
  });
});
