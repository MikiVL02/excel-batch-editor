const { ipcMain, dialog, app, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { listTemplates, saveTemplate, updateTemplate, deleteTemplate } = require("../db/templateDb");

const APPDATA_DIR = path.join(app.getPath("userData"), "excel-batch-editor", "templates");
fs.mkdirSync(APPDATA_DIR, { recursive: true });

const PYTHON_BIN = app.isPackaged
  ? path.join(process.resourcesPath, "python", "main")
  : path.join(__dirname, "../../python/main.py");

function callPython(payload) {
  return new Promise((resolve, reject) => {
    const isPackaged = app.isPackaged;
    const proc = isPackaged
      ? spawn(PYTHON_BIN)
      : spawn(process.env.PYTHON_PATH || "python3", [PYTHON_BIN]);

    let stdout = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => console.error("[python]", d.toString()));
    proc.on("close", () => {
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (e) {
        reject(new Error("Python 返回了无效 JSON: " + stdout));
      }
    });
    proc.stdin.write(JSON.stringify(payload) + "\n");
    proc.stdin.end();
  });
}

ipcMain.handle("template:list", () => listTemplates());

ipcMain.handle("template:save", (_, data) => {
  const id = saveTemplate(data);
  return id;
});

ipcMain.handle("template:update", (_, id, data) => {
  updateTemplate(id, data);
  return true;
});

ipcMain.handle("template:delete", (_, id) => {
  deleteTemplate(id);
  return true;
});

ipcMain.handle("template:parse", async (_, filePath) => {
  return callPython({ action: "parse_template", file_path: filePath });
});

ipcMain.handle("file:select", async (_, filters = []) => {
  const result = await dialog.showOpenDialog({ filters, properties: ["openFile"] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("file:selectDir", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("file:openDir", (_, dirPath) => {
  shell.openPath(dirPath);
});

ipcMain.handle("file:copyToAppData", (_, srcPath, templateId) => {
  const dir = path.join(APPDATA_DIR, templateId);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, path.basename(srcPath));
  fs.copyFileSync(srcPath, dest);
  return dest;
});

module.exports = { callPython };
