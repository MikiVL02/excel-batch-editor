import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressPanel from "../components/ProgressPanel";

export default function Generate() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedId = location.state?.templateId;

  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(preselectedId || "");
  const [dataSource, setDataSource] = useState("file");
  const [dataFilePath, setDataFilePath] = useState("");
  const [manualRows, setManualRows] = useState([{}]);
  const [outputDir, setOutputDir] = useState("");
  const [filenamePattern, setFilenamePattern] = useState("输出_{{编号}}.xlsx");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    window.api.listTemplates().then(setTemplates);
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedId);
  const fields = selectedTemplate?.fields || [];

  async function handleSelectDataFile() {
    const path = await window.api.selectFile([
      { name: "Excel 文件", extensions: ["xlsx"] },
    ]);
    if (path) setDataFilePath(path);
  }

  async function handleSelectOutputDir() {
    const dir = await window.api.selectDirectory();
    if (dir) setOutputDir(dir);
  }

  function updateManualRow(rowIdx, fieldName, value) {
    setManualRows((prev) => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [fieldName]: value };
      return next;
    });
  }

  function addManualRow() {
    setManualRows((prev) => [...prev, {}]);
  }

  function removeManualRow(idx) {
    setManualRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleGenerate() {
    if (!selectedId) return alert("请选择模板");
    if (!outputDir) return alert("请选择输出目录");
    if (dataSource === "file" && !dataFilePath) return alert("请选择数据源 Excel 文件");

    setGenerating(true);
    setResults(null);
    try {
      const result = await window.api.generate({
        template_path: selectedTemplate.file_path,
        fields: fields,
        rows: dataSource === "manual" ? manualRows : null,
        data_file_path: dataSource === "file" ? dataFilePath : null,
        output_dir: outputDir,
        filename_pattern: filenamePattern,
      });
      setResults(result.results);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">批量生成</h1>
          <button onClick={() => navigate("/templates")} className="text-gray-400 hover:text-gray-600 text-sm">
            ← 返回模板列表
          </button>
        </div>

        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择模板</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">请选择...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数据来源</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" value="file" checked={dataSource === "file"} onChange={() => setDataSource("file")} />
                上传 Excel 数据源
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" value="manual" checked={dataSource === "manual"} onChange={() => setDataSource("manual")} />
                手动填写
              </label>
            </div>
          </div>

          {dataSource === "file" ? (
            <div className="flex gap-2">
              <input readOnly value={dataFilePath} className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50" placeholder="选择数据源 Excel 文件..." />
              <button onClick={handleSelectDataFile} className="border rounded px-4 py-2 text-sm hover:bg-gray-100">选择文件</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse w-full">
                <thead>
                  <tr>
                    {fields.map((f) => (
                      <th key={f.id} className="border px-2 py-1 bg-gray-50 text-left text-xs font-medium">{f.name}</th>
                    ))}
                    <th className="border px-2 py-1 bg-gray-50 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {manualRows.map((row, idx) => (
                    <tr key={idx}>
                      {fields.map((f) => (
                        <td key={f.id} className="border px-1 py-1">
                          <input
                            value={row[f.name] || ""}
                            onChange={(e) => updateManualRow(idx, f.name, e.target.value)}
                            className="w-full px-1 py-0.5 text-sm outline-none"
                          />
                        </td>
                      ))}
                      <td className="border px-2 py-1 text-center">
                        <button onClick={() => removeManualRow(idx)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addManualRow} className="text-blue-600 text-xs mt-2 hover:underline">+ 添加行</button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">输出目录</label>
            <div className="flex gap-2">
              <input readOnly value={outputDir} className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50" placeholder="选择输出文件夹..." />
              <button onClick={handleSelectOutputDir} className="border rounded px-4 py-2 text-sm hover:bg-gray-100">选择目录</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">输出文件命名规则</label>
            <input
              value={filenamePattern}
              onChange={(e) => setFilenamePattern(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm font-mono"
              placeholder="如：{{编号}}_报告.xlsx"
            />
            <p className="text-xs text-gray-400 mt-1">支持使用 {"{{字段名}}"} 作为变量</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !selectedId || !outputDir}
            className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "生成中..." : "开始生成"}
          </button>
        </div>

        {results && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="font-medium mb-4">生成结果</h2>
            <ProgressPanel
              results={results}
              outputDir={outputDir}
              onOpenDir={() => window.api.openDirectory(outputDir)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
