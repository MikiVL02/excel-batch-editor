# Excel 批量编辑器

跨平台桌面应用（Mac/Windows），支持上传 Excel 模板、标记可替换字段，批量生成填充好的输出文件。

## 开发环境

### 前置条件
- Node.js 18+
- Python 3.9+（或 3.11+ 更佳）

### 安装依赖

```bash
npm install
cd /path/to/excel-batch-editor && source python/.venv/bin/activate 2>/dev/null || python3 -m venv python/.venv && source python/.venv/bin/activate && pip install -r python/requirements.txt
```

或分步执行：

```bash
# Node.js 依赖
npm install

# Python 依赖
cd excel-batch-editor
python3 -m venv python/.venv
source python/.venv/bin/activate   # Windows: python\.venv\Scripts\activate
pip install -r python/requirements.txt
```

### 开发模式启动

```bash
export PYTHON_PATH=$(which python3)   # 或使用 venv：export PYTHON_PATH=$(pwd)/python/.venv/bin/python3
NODE_ENV=development npm run dev
```

应用将在 `http://localhost:5173` 启动渲染进程，Electron 窗口自动打开。

### 运行 Python 测试

```bash
source python/.venv/bin/activate
pytest tests/python/ -v
```

## 项目结构

```
excel-batch-editor/
├── electron/          # Electron 主进程
│   ├── main.js        # 入口
│   ├── preload.js     # IPC 桥接
│   ├── ipc/           # IPC handler
│   └── db/            # SQLite 操作
├── renderer/          # React 前端（Vite）
│   └── src/
│       ├── pages/     # 页面组件
│       └── components/ # 通用组件
├── python/            # Python Excel 处理
│   ├── main.py        # stdin/stdout 入口
│   ├── parser.py      # 模板解析
│   └── generator.py   # 批量生成
└── tests/             # 测试
    └── python/        # Python 单元测试
```

## 技术栈

- **桌面壳**：Electron 28（跨平台）
- **UI**：React 18 + Vite + Tailwind CSS
- **Excel 处理**：Python 3 + openpyxl
- **本地存储**：SQLite（better-sqlite3）
