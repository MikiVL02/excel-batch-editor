const { test, expect, _electron: electron } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const os = require("os");

const APP_ROOT = path.join(__dirname, "../..");
const FIXTURE_TEMPLATE = path.join(__dirname, "../fixtures/sample_template.xlsx");
const OUTPUT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "ebe-test-"));

let app;
let page;

test.beforeAll(async () => {
  app = await electron.launch({
    args: [APP_ROOT],
    // 用 test 模式：不是 production，mock IPC 注册；不是 development，加载 dist
    env: { ...process.env, NODE_ENV: "test" },
  });
  page = await app.firstWindow();
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("[renderer]", msg.text());
  });
  await page.waitForSelector("button:has-text('+ 新建模板')", { timeout: 10000 });
});

test.afterAll(async () => {
  await app.close();
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
});

test("T1: 显示模板列表页", async () => {
  await expect(page.locator("button:has-text('+ 新建模板')")).toBeVisible();
});

test("T2: 新建模板", async () => {
  await page.click("button:has-text('+ 新建模板')");
  await page.waitForSelector("input[placeholder='如：月度报告模板']", { timeout: 5000 });

  await page.fill("input[placeholder='如：月度报告模板']", "测试模板");
  await page.fill("input[placeholder='如：财务部']", "测试分组");

  // 注入下次对话框返回值，再点击选择文件
  await page.evaluate((p) => window.api.mockDialog(p), FIXTURE_TEMPLATE);
  await page.click("button:has-text('选择文件')");

  // 等待文件路径填入
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll("input[readonly]")).some(i => i.value.includes(".xlsx")),
    { timeout: 8000 }
  );

  // 等待 parse 完成
  await page.waitForTimeout(2000);

  await page.click("button:has-text('保存模板')");
  await page.waitForSelector("span:has-text('测试模板')", { timeout: 8000 });
  await expect(page.locator("span:has-text('测试模板')")).toBeVisible();
});

test("T3: 模板列表显示详情", async () => {
  await page.click("span:has-text('测试模板')");
  await expect(page.locator("h1")).toContainText("测试模板", { timeout: 3000 });
  await expect(page.locator("button:has-text('批量生成')")).toBeVisible();
});

test("T4: 批量生成 - 手动输入", async () => {
  await page.click("button:has-text('批量生成')");
  await page.waitForSelector("h1:has-text('批量生成')", { timeout: 5000 });

  await page.click("label:has-text('手动填写')");
  await page.waitForTimeout(500);

  const inputs = page.locator("table tbody tr:first-child input");
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    await inputs.nth(i).fill(`值${i + 1}`);
  }

  // 注入输出目录
  await page.evaluate((dir) => window.api.mockDialog(dir), OUTPUT_DIR);
  await page.click("button:has-text('选择目录')");
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll("input[readonly]")).some(i => i.value.length > 0 && !i.value.includes(".xlsx")),
    { timeout: 5000 }
  );

  await page.click("button:has-text('开始生成')");
  await expect(page.locator("text=生成结果")).toBeVisible({ timeout: 20000 });

  const files = fs.readdirSync(OUTPUT_DIR);
  console.log("生成的文件：", files);
  expect(files.length).toBeGreaterThan(0);
});

test("T5: 编辑模板名称", async () => {
  await page.click("button:has-text('← 返回模板列表')");
  await page.waitForSelector("button:has-text('+ 新建模板')", { timeout: 5000 });

  await page.click("span:has-text('测试模板')");
  await page.waitForSelector("button:has-text('编辑字段映射')", { timeout: 3000 });
  await page.click("button:has-text('编辑字段映射')");

  await page.waitForSelector("input[placeholder='如：月度报告模板']", { timeout: 5000 });
  await page.fill("input[placeholder='如：月度报告模板']", "测试模板（已修改）");
  await page.click("button:has-text('保存模板')");

  await page.waitForSelector("span:has-text('测试模板（已修改）')", { timeout: 5000 });
  await expect(page.locator("span:has-text('测试模板（已修改）')")).toBeVisible();
});

test("T6: 删除模板", async () => {
  page.once("dialog", (d) => d.accept());
  await page.locator("div.flex.items-center.justify-between button:has-text('删除')").first().click();
  await page.waitForTimeout(800);
  await expect(page.locator("span:has-text('测试模板（已修改）')")).not.toBeVisible({ timeout: 3000 });
});
