import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRPage from "./QRPage";
import VmsFrontendStarter from "./VmsFrontendStarter";
import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRPage />} />
        <Route path="/visitor-registration" element={<VmsFrontendStarter />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
