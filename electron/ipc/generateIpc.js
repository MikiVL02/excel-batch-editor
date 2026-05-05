const { ipcMain } = require("electron");
const { callPython } = require("./templateIpc");

ipcMain.handle("generate:run", async (_, req) => {
  return callPython({ action: "generate", ...req });
});
