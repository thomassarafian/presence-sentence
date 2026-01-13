import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (userData) => {
    setLoading(true);
    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      setTimeout(() => navigate('/'), 2000);
    }

    return result;
  };

  return <RegisterForm onRegister={handleRegister} loading={loading} />;
}
