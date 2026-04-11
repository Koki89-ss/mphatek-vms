import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import QRPage from "./QRPage";
import VmsFrontendStarter from "./VmsFrontendStarter";
import AdminDashboard from "./AdminDashboard";
import LoginPage from "./LoginPage";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRPage />} />
        <Route path="/visitor-registration" element={<VmsFrontendStarter />} />
        <Route
          path="/admin"
          element={
            user
              ? <AdminDashboard user={user} onLogout={() => setUser(null)} />
              : <LoginPage onLogin={setUser} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
