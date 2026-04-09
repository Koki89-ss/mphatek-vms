import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRPage from "./QRPage";
import VmsFrontendStarter from "./VmsFrontendStarter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRPage />} />
        <Route path="/visitor-registration" element={<VmsFrontendStarter />} />
      </Routes>
    </Router>
  );
}

export default App;