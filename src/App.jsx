import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Memory from "./pages/Memory";
import Settings from "./pages/Settings";
import Gallery from "./pages/Gallery";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/memory" element={<AppLayout><Memory /></AppLayout>} />
      <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
    </Routes>
  );
}
