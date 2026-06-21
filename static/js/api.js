/* Camada de API — usa URLs relativas (funciona em qualquer host, ex.: onrender). */

async function apiRequest(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  let data = {};
  try { data = await res.json(); } catch (_) {}
  return { ok: res.ok, status: res.status, data };
}

async function createTheme(theme) {
  const { data } = await apiRequest("POST", "/create_theme", theme);
  return data;
}

async function updateTheme(id, theme) {
  const { data } = await apiRequest("PUT", `/update_theme/${id}`, theme);
  return data;
}

async function deleteTheme(id) {
  const { data } = await apiRequest("DELETE", `/delete_theme/${id}`);
  return data;
}

async function saveScore(themeId, score, mistakes, time) {
  return apiRequest("POST", "/save_score", { theme_id: themeId, score, mistakes, time });
}

async function verifyPassword(id, password) {
  const { data } = await apiRequest("POST", `/verify_password/${id}`, { password });
  return data;
}
