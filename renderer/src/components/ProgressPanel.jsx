import React from "react";

export default function ProgressPanel({ results, outputDir, onOpenDir }) {
  if (!results) return null;

  const success = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span className="text-green-600 font-medium">成功：{success}</span>
        {failed > 0 && <span className="text-red-500 font-medium">失败：{failed}</span>}
      </div>
      {outputDir && (
        <button
          onClick={onOpenDir}
          className="text-blue-600 text-sm hover:underline"
        >
          打开输出文件夹 →
        </button>
      )}
      {failed > 0 && (
        <div className="border border-red-100 rounded bg-red-50 p-3 space-y-1">
          <p className="text-xs font-medium text-red-600">失败详情：</p>
          {results
            .filter((r) => r.status === "error")
            .map((r) => (
              <p key={r.row} className="text-xs text-red-500">
                第 {r.row + 1} 行：{r.error}
              </p>
            ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {results.map((r) => (
          <div key={r.row} className={`text-xs px-2 py-1 rounded flex justify-between ${r.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            <span>{r.status === "success" ? "✓" : "✗"} 第 {r.row + 1} 行</span>
            <span className="truncate ml-2 text-gray-400">{r.file?.split("/").pop() || r.file?.split("\\").pop()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
