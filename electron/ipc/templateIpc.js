const { ipcMain, dialog, app, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { listTemplates, saveTemplate, updateTemplate, deleteTemplate } = require("../db/templateDb");

const APPDATA_DIR = path.join(app.getPath("userData"), "excel-batch-editor", "templates");
fs.mkdirSync(APPDATA_DIR, { recursive: true });

const PYTHON_BIN = app.isPackaged
  ? path.join(
      process.resourcesPath,
      "python",
      process.platform === "win32" ? "main.exe" : "main"
    )
  : path.join(__dirname, "../../python/main.py");

function callPython(payload) {
  return new Promise((resolve, reject) => {
    const isPackaged = app.isPackaged;
    // PYTHONUTF8=1 确保 Windows 上 Python 使用 UTF-8 编码
    const spawnEnv = { ...process.env, PYTHONUTF8: "1" };
    const proc = isPackaged
      ? spawn(PYTHON_BIN, [], { env: spawnEnv })
      : spawn(process.env.PYTHON_PATH || "python3", [PYTHON_BIN], { env: spawnEnv });

    const chunks = [];
    proc.stdout.on("data", (d) => chunks.push(d));
    proc.stderr.on("data", (d) => console.error("[python]", d.toString("utf8")));
    proc.on("close", () => {
      const stdout = Buffer.concat(chunks).toString("utf8").trim();
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error("Python 返回了无效 JSON: " + stdout));
      }
    });
    proc.on("error", (e) => reject(new Error("Python 进程启动失败: " + e.message)));
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

let _mockDialogPath = null;
if (process.env.NODE_ENV !== "production") {
  ipcMain.handle("test:mockDialog", (_, p) => { _mockDialogPath = p; });
}

ipcMain.handle("file:select", async (_, filters = []) => {
  if (_mockDialogPath) { const p = _mockDialogPath; _mockDialogPath = null; return p; }
  const result = await dialog.showOpenDialog({ filters, properties: ["openFile"] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("file:selectDir", async () => {
  if (_mockDialogPath) { const p = _mockDialogPath; _mockDialogPath = null; return p; }
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
