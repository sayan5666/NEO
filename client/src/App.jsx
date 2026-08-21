import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { InterviewPage } from './pages/InterviewPage';
import { CodingRoundPage } from './pages/CodingRoundPage';
import { ReportPage } from './pages/ReportPage';
import { CritiquePage } from './pages/CritiquePage';
import BuyTokensPage from './pages/BuyTokensPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/buy-tokens" element={<BuyTokensPage />} />
          <Route path="/interview/:sessionId" element={<InterviewPage />} />
          <Route path="/interview/:sessionId/code" element={<CodingRoundPage />} />
          <Route path="/report/:sessionId" element={<ReportPage />} />
          <Route path="/report/:sessionId/critique" element={<CritiquePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
