import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuotesByAuthor } from '../services/quoteService';

export default function AuthorPage() {
  const { pseudo } = useParams();
  const [author, setAuthor] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    // Prevent double fetch in StrictMode
    if (fetchAttempted.current) return;
    fetchAttempted.current = true;

    const fetchAuthorQuotes = async () => {
      setLoading(true);
      const result = await getQuotesByAuthor(pseudo);

      if (result.success) {
        setAuthor(result.data.author);
        setQuotes(result.data.quotes);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    fetchAuthorQuotes();
  }, [pseudo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">
            {author?.pseudo}
          </h1>
          <p className="text-slate-500 text-center">
            {quotes.length} citation{quotes.length > 1 ? 's' : ''} publique
            {quotes.length > 1 ? 's' : ''}
          </p>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/40 text-center">
            <p className="text-slate-600">
              Aucune citation publique pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((q) => (
              <div
                key={q._id}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40"
              >
                <p className="text-xl text-slate-800 italic">"{q.quote}"</p>
                <p className="text-sm text-slate-400 mt-3">
                  {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
