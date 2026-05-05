import React from "react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import TemplateList from "./pages/TemplateList";
import TemplateConfig from "./pages/TemplateConfig";
import Generate from "./pages/Generate";

export default function App() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/templates" element={<TemplateList />} />
        <Route path="/templates/new" element={<TemplateConfig />} />
        <Route path="/templates/:id/edit" element={<TemplateConfig />} />
        <Route path="/generate" element={<Generate />} />
      </Routes>
    </MemoryRouter>
  );
}
