const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  listTemplates: () => ipcRenderer.invoke("template:list"),
  saveTemplate: (data) => ipcRenderer.invoke("template:save", data),
  updateTemplate: (id, data) => ipcRenderer.invoke("template:update", id, data),
  deleteTemplate: (id) => ipcRenderer.invoke("template:delete", id),
  parseTemplate: (filePath) => ipcRenderer.invoke("template:parse", filePath),

  selectFile: (filters) => ipcRenderer.invoke("file:select", filters),
  selectDirectory: () => ipcRenderer.invoke("file:selectDir"),
  openDirectory: (dirPath) => ipcRenderer.invoke("file:openDir", dirPath),
  copyFileToAppData: (srcPath, templateId) =>
    ipcRenderer.invoke("file:copyToAppData", srcPath, templateId),

  generate: (req) => ipcRenderer.invoke("generate:run", req),

  // 仅测试环境使用：注入下一次对话框返回值
  mockDialog: (p) => ipcRenderer.invoke("test:mockDialog", p),
});
