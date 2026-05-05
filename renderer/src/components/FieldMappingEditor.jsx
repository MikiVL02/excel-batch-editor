import React from "react";

const FIELD_TYPES = [
  { value: "text", label: "文本" },
  { value: "image", label: "图片" },
  { value: "table_range", label: "批量填充区域" },
];

export default function FieldMappingEditor({ fields, onChange }) {
  function addField() {
    onChange([...fields, { name: "", type: "text", sheet: "Sheet1", cell: "" }]);
  }

  function updateField(index, patch) {
    const next = fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange(next);
  }

  function removeField(index) {
    onChange(fields.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 font-medium px-1">
        <span>字段名</span>
        <span>类型</span>
        <span>Sheet</span>
        <span>单元格</span>
        <span></span>
      </div>
      {fields.map((f, i) => (
        <div key={i} className="grid grid-cols-5 gap-2 items-center">
          <input
            value={f.name}
            onChange={(e) => updateField(i, { name: e.target.value })}
            placeholder="如：编号"
            className="border rounded px-2 py-1 text-sm"
          />
          <select
            value={f.type}
            onChange={(e) => updateField(i, { type: e.target.value })}
            className="border rounded px-2 py-1 text-sm"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            value={f.sheet}
            onChange={(e) => updateField(i, { sheet: e.target.value })}
            placeholder="Sheet1"
            className="border rounded px-2 py-1 text-sm"
          />
          <input
            value={f.cell}
            onChange={(e) => updateField(i, { cell: e.target.value })}
            placeholder="如：B3"
            className="border rounded px-2 py-1 text-sm font-mono"
          />
          <button
            onClick={() => removeField(i)}
            className="text-gray-300 hover:text-red-500 text-sm"
          >
            删除
          </button>
        </div>
      ))}
      <button
        onClick={addField}
        className="text-blue-600 text-sm hover:underline"
      >
        + 添加字段
      </button>
    </div>
  );
}
