import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    handleVerification();
  }, [token]);

  const handleVerification = async () => {
    const result = await verifyEmail(token);

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      // Refresh auth context to update user data
      await checkAuth();
      // Redirect to home after 3 seconds
      setTimeout(() => navigate('/'), 3000);
    } else {
      setStatus('error');
      setMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Vérification de votre email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Email vérifié !
            </h2>
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-4">
              Redirection vers votre profil...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Erreur de vérification
            </h2>
            <p className="text-gray-700">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
