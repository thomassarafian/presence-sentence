import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import AuthorPage from './pages/AuthorPage.jsx';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/auteur/:pseudo" element={<AuthorPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
