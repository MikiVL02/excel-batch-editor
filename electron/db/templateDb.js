const db = require("./init");
const { randomUUID } = require("crypto");

function listTemplates() {
  const templates = db.prepare("SELECT * FROM templates ORDER BY updated_at DESC").all();
  return templates.map((t) => ({
    ...t,
    fields: db.prepare("SELECT * FROM fields WHERE template_id = ?").all(t.id),
  }));
}

function saveTemplate({ name, grp = "", file_path, fields = [] }) {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO templates (id, name, grp, file_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, name, grp, file_path, now, now);
  _saveFields(id, fields);
  return id;
}

function updateTemplate(id, { name, grp, fields }) {
  const now = new Date().toISOString();
  if (name !== undefined || grp !== undefined) {
    db.prepare("UPDATE templates SET name = COALESCE(?, name), grp = COALESCE(?, grp), updated_at = ? WHERE id = ?")
      .run(name ?? null, grp ?? null, now, id);
  }
  if (fields !== undefined) {
    db.prepare("DELETE FROM fields WHERE template_id = ?").run(id);
    _saveFields(id, fields);
  }
}

function deleteTemplate(id) {
  db.prepare("DELETE FROM templates WHERE id = ?").run(id);
}

function _saveFields(templateId, fields) {
  const stmt = db.prepare(
    "INSERT INTO fields (id, template_id, name, type, sheet, cell) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const f of fields) {
    stmt.run(randomUUID(), templateId, f.name, f.type, f.sheet, f.cell);
  }
}

module.exports = { listTemplates, saveTemplate, updateTemplate, deleteTemplate };
