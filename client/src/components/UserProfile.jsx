import { useState, useEffect } from 'react';
import { getUserQuotes, deleteQuote, updateQuote } from '../services/quoteService';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchUserQuotes();
  }, []);

  const fetchUserQuotes = async () => {
    setLoading(true);
    const result = await getUserQuotes();

    if (result.success) {
      setQuotes(result.data.quotes);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette citation ?')) {
      return;
    }

    const result = await deleteQuote(id);

    if (result.success) {
      setMessage('Citation supprimée avec succès');
      setQuotes(quotes.filter((q) => q._id !== id));
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.error);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (quote) => {
    setEditingId(quote._id);
    setEditText(quote.quote);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) {
      setMessage('La citation ne peut pas être vide');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const result = await updateQuote(id, { quote: editText });

    if (result.success) {
      setMessage('Citation modifiée avec succès');
      setQuotes(
        quotes.map((q) =>
          q._id === id ? { ...q, quote: editText } : q
        )
      );
      setEditingId(null);
      setEditText('');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.error);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mon Profil
          </h1>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">Pseudo :</span> {user?.pseudo}
            </p>
            <p>
              <span className="font-semibold">Email :</span> {user?.email}
            </p>
            <p>
              <span className="font-semibold">Statut :</span>{' '}
              {user?.emailVerified ? (
                <span className="text-green-600 font-medium">
                  ✓ Email vérifié
                </span>
              ) : (
                <span className="text-orange-600 font-medium">
                  ⚠ Email non vérifié
                </span>
              )}
            </p>
          </div>

          {!user?.emailVerified && (
            <div className="mt-4 p-4 bg-orange-100 border border-orange-300 rounded-lg text-orange-800 text-sm">
              Vérifiez votre email pour rendre vos citations publiques. Consultez vos emails.
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Mes Citations ({quotes.length})
          </h2>

          {message && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-center text-gray-600">Chargement...</p>
          ) : quotes.length === 0 ? (
            <p className="text-center text-gray-600">
              Vous n'avez pas encore de citations.
            </p>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote._id}
                  className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
                >
                  {editingId === quote._id ? (
                    <div className="mb-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                        rows="3"
                      />
                    </div>
                  ) : (
                    <p className="text-lg text-gray-800 italic mb-2">
                      "{quote.quote}"
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-4">
                    — {quote.author}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {quote.isPublic ? (
                        <span className="text-green-600">🌍 Public</span>
                      ) : (
                        <span className="text-orange-600">🔒 Privé</span>
                      )}
                    </span>
                    <span>
                      Créé le {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {editingId === quote._id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(quote._id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(quote)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(quote._id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
