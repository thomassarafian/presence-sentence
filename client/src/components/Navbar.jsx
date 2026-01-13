import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Citation Présence
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                Profil
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700">{user?.pseudo}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
