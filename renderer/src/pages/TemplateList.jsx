import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.api.listTemplates().then(setTemplates);
  }, []);

  async function handleDelete(id) {
    if (!confirm("确认删除此模板？")) return;
    await window.api.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const groups = [...new Set(templates.map((t) => t.grp || "未分组"))];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧模板列表 */}
      <aside className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex gap-2">
          <button
            onClick={() => navigate("/templates/new")}
            className="flex-1 bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700"
          >
            + 新建模板
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {groups.map((grp) => (
            <div key={grp} className="mb-4">
              <div className="text-xs text-gray-400 font-semibold px-2 py-1 uppercase">{grp}</div>
              {templates
                .filter((t) => (t.grp || "未分组") === grp)
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`flex items-center justify-between rounded px-3 py-2 cursor-pointer text-sm ${
                      selected?.id === t.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                      className="text-gray-300 hover:text-red-500 ml-2 text-xs"
                    >
                      删除
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </aside>

      {/* 右侧详情 */}
      <main className="flex-1 p-8">
        {selected ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{selected.name}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/templates/${selected.id}/edit`)}
                  className="border rounded px-4 py-2 text-sm hover:bg-gray-100"
                >
                  编辑字段映射
                </button>
                <button
                  onClick={() => navigate("/generate", { state: { templateId: selected.id } })}
                  className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700"
                >
                  批量生成
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6 space-y-3 text-sm text-gray-600">
              <p><span className="font-medium text-gray-800">分组：</span>{selected.grp || "未分组"}</p>
              <p><span className="font-medium text-gray-800">字段数量：</span>{selected.fields?.length ?? 0}</p>
              <p><span className="font-medium text-gray-800">创建时间：</span>{new Date(selected.created_at).toLocaleString("zh-CN")}</p>
              <p><span className="font-medium text-gray-800">最后修改：</span>{new Date(selected.updated_at).toLocaleString("zh-CN")}</p>
              {selected.fields?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-800 mb-2">字段列表：</p>
                  <div className="space-y-1">
                    {selected.fields.map((f) => (
                      <div key={f.id} className="flex gap-4 bg-gray-50 rounded px-3 py-1">
                        <span className="font-mono text-blue-600">{"{{"}{f.name}{"}}"}</span>
                        <span className="text-gray-400">{f.type}</span>
                        <span>{f.sheet} · {f.cell}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>选择一个模板，或新建模板</p>
          </div>
        )}
      </main>
    </div>
  );
}
