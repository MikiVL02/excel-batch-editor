import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FieldMappingEditor from "../components/FieldMappingEditor";

export default function TemplateConfig() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [grp, setGrp] = useState("");
  const [filePath, setFilePath] = useState("");
  const [originalFilePath, setOriginalFilePath] = useState("");
  const [fields, setFields] = useState([]);
  const [autoDetected, setAutoDetected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      window.api.listTemplates().then((templates) => {
        const t = templates.find((t) => t.id === id);
        if (t) {
          setName(t.name);
          setGrp(t.grp || "");
          setFilePath(t.file_path);
          setOriginalFilePath(t.file_path);
          setFields(t.fields || []);
        }
      });
    }
  }, [id]);

  async function handleSelectFile() {
    const path = await window.api.selectFile([
      { name: "Excel 文件", extensions: ["xlsx"] },
    ]);
    if (!path) return;
    setFilePath(path);
    const result = await window.api.parseTemplate(path);
    if (result.placeholders?.length > 0) {
      setAutoDetected(result.placeholders);
      const detected = result.placeholders.map((p) => ({
        name: p.name,
        type: "text",
        sheet: p.sheet,
        cell: p.cell,
      }));
      setFields((prev) => {
        const existing = prev.map((f) => f.name);
        const newOnes = detected.filter((d) => !existing.includes(d.name));
        return [...prev, ...newOnes];
      });
    }
  }

  async function handleSave() {
    if (!name.trim() || !filePath) return alert("请填写模板名称并选择文件");
    setSaving(true);
    try {
      if (!isEdit) {
        const tempId = Date.now().toString();
        const storedPath = await window.api.copyFileToAppData(filePath, tempId);
        await window.api.saveTemplate({ name, grp, file_path: storedPath, fields });
      } else {
        let storedPath;
        if (filePath !== originalFilePath) {
          storedPath = await window.api.copyFileToAppData(filePath, id);
        }
        await window.api.updateTemplate(id, { name, grp, file_path: storedPath, fields });
      }
      navigate("/templates");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{isEdit ? "编辑模板" : "新建模板"}</h1>
          <button onClick={() => navigate("/templates")} className="text-gray-400 hover:text-gray-600 text-sm">
            ← 返回
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="如：月度报告模板"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分组（可选）</label>
            <input
              value={grp}
              onChange={(e) => setGrp(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="如：财务部"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excel 模板文件</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={filePath}
                className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50"
                placeholder="点击右侧按钮选择文件..."
              />
              <button
                onClick={handleSelectFile}
                className="border rounded px-4 py-2 text-sm hover:bg-gray-100"
              >
                选择文件
              </button>
            </div>
            {autoDetected.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                已自动识别 {autoDetected.length} 个占位符
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">字段映射</label>
            <FieldMappingEditor fields={fields} onChange={setFields} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={() => navigate("/templates")}
            className="border rounded px-4 py-2 text-sm hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存模板"}
          </button>
        </div>
      </div>
    </div>
  );
}
