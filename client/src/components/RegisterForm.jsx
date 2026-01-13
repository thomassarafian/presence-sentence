import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterForm({ onRegister, loading }) {
  const [formData, setFormData] = useState({
    email: '',
    pseudo: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear field error on change
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    const result = await onRegister(formData);

    if (result.success) {
      setMessage(result.message);
    } else {
      if (result.errors) {
        // Field-specific errors
        const fieldErrors = {};
        result.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        // General error
        setErrors({ general: result.error });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Inscription
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="pseudo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Pseudo
            </label>
            <input
              type="text"
              id="pseudo"
              name="pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.pseudo ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
              placeholder="VotrePseudo"
            />
            {errors.pseudo && (
              <p className="mt-1 text-sm text-red-600">{errors.pseudo}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {errors.general && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
