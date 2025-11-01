import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import DemoPage from "./pages/DemoPage";
import AIAnalysisPage from "./pages/AIAnalysisPage";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('figment_auth');
    if (auth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('figment_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('figment_auth');
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />
          } />
          
          {/* Auth Page */}
          <Route path="/auth" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            isAuthenticated ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/auth" />
          } />
          <Route path="/demo" element={
            isAuthenticated ? <DemoPage onLogout={handleLogout} /> : <Navigate to="/auth" />
          } />
          <Route path="/ai-analysis" element={
            isAuthenticated ? <AIAnalysisPage onLogout={handleLogout} /> : <Navigate to="/auth" />
          } />
        </Routes>
      </BrowserRouter>
      <Toaster richColors />
    </div>
  );
}

export default App;
