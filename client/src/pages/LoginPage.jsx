import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoading(true);
    const result = await login(credentials);
    setLoading(false);

    if (result.success) {
      navigate('/');
    }

    return result;
  };

  return <LoginForm onLogin={handleLogin} loading={loading} />;
}
