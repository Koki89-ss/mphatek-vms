import { BrowserRouter as Router, Routes, Route, Navigate  } from "react-router-dom";
import { useState } from "react";
import QRPage from "./QRPage";
import VmsFrontendStarter from "./VmsFrontendStarter";
import AdminDashboard from "./HostDashboard";
import ReceptionDashboard from "./ReceptionDashboard";
import LoginPage from "./LoginPage";

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("vms_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (data) => {
    localStorage.setItem("vms_user", JSON.stringify(data));
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("vms_user");
    setUser(null);
  };

   function getDashboard() {
    if (!user) return <Navigate to="/login" replace />;
    if (user.Role === "reception") {
      return <ReceptionDashboard user={user} onLogout={handleLogout} />;
    }
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRPage />} />
        <Route path="/visitor-registration" element={<VmsFrontendStarter />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
                {getDashboard()}
            </ProtectedRoute>
            
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
