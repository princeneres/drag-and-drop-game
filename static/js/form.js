/* Construtor de formulário de tema (criar e editar). */

const formEl = document.getElementById("theme-form");
const mode = formEl.dataset.mode;
const themeId = formEl.dataset.id;
const categoriesEl = document.getElementById("categories");

/* ---- Categorias e itens ---- */
function addCategory(name = "", items = [{ name: "" }]) {
  const block = document.createElement("div");
  block.className = "category-block";
  block.innerHTML = `
    <div class="cat-head">
      <input class="input category-name" placeholder="Nome da categoria" />
      <button type="button" class="btn btn-danger btn-icon remove-category" title="Remover categoria">🗑️</button>
    </div>
    <div class="items-list"></div>
    <button type="button" class="btn btn-ghost add-item" style="margin-top:.6rem">＋ Item</button>
  `;
  block.querySelector(".category-name").value = name;
  const list = block.querySelector(".items-list");
  block.querySelector(".remove-category").addEventListener("click", () => block.remove());
  block.querySelector(".add-item").addEventListener("click", () => addItem(list));
  (items.length ? items : [{ name: "" }]).forEach((it) => addItem(list, it.name));
  categoriesEl.appendChild(block);
}

function addItem(list, value = "") {
  const row = document.createElement("div");
  row.className = "item-row";
  row.innerHTML = `
    <input class="input item-name" placeholder="Item da categoria" />
    <button type="button" class="btn btn-danger btn-icon remove-item" title="Remover item">✕</button>
  `;
  row.querySelector(".item-name").value = value;
  row.querySelector(".remove-item").addEventListener("click", () => row.remove());
  list.appendChild(row);
}

document.getElementById("add-category").addEventListener("click", () => addCategory());

/* ---- Toggle de senha ---- */
const privateEl = document.getElementById("private");
const pwWrap = document.getElementById("password-wrap");
privateEl.addEventListener("change", () => pwWrap.classList.toggle("hide", !privateEl.checked));

/* ---- Coleta e envio ---- */
function collectTheme() {
  const theme = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    private: privateEl.checked,
    categories: [],
  };
  if (theme.private) theme.password = document.getElementById("password").value;

  categoriesEl.querySelectorAll(".category-block").forEach((block) => {
    const items = [];
    block.querySelectorAll(".item-name").forEach((i) => {
      const v = i.value.trim();
      if (v) items.push({ name: v });
    });
    theme.categories.push({ name: block.querySelector(".category-name").value.trim(), items });
  });
  return theme;
}

document.getElementById("save-theme").addEventListener("click", async () => {
  const theme = collectTheme();
  const res = mode === "edit" ? await updateTheme(themeId, theme) : await createTheme(theme);
  if (res.success) {
    toast(res.success);
    setTimeout(() => (window.location.href = mode === "edit" ? `/tema/${themeId}` : "/"), 700);
  } else {
    toast(res.error || "Algo deu errado.", "error");
  }
});

/* ---- Inicialização ---- */
if (mode === "edit" && Array.isArray(window.THEME_DATA)) {
  window.THEME_DATA.forEach((c) => addCategory(c.name, c.items));
} else {
  addCategory();
  addCategory();
}
