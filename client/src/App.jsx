import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuote, createQuote } from './services/quoteService';
import { useAuth } from './contexts/AuthContext';
import QuoteDisplay from './components/QuoteDisplay';
import QuoteForm from './components/QuoteForm';

const PENDING_QUOTE_KEY = 'pendingQuote';

function App() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');
  const [quoteId, setQuoteId] = useState(null);
  const [author, setAuthor] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const timeoutRef = useRef(null);
  const pendingQuoteSubmitted = useRef(false);

  const clearMessageAfterDelay = (delay) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setMessage('');
      timeoutRef.current = null;
    }, delay);
  };
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Submit pending quote after user authenticates
  useEffect(() => {
    const submitPendingQuote = async () => {
      const pendingQuote = localStorage.getItem(PENDING_QUOTE_KEY);

      if (pendingQuote && isAuthenticated && !authLoading && !pendingQuoteSubmitted.current) {
        pendingQuoteSubmitted.current = true;
        localStorage.removeItem(PENDING_QUOTE_KEY);

        setLoading(true);
        try {
          const result = await createQuote(pendingQuote);

          if (result.success) {
            setMessage('Citation ajoutée avec succès !');
            clearMessageAfterDelay(3000);
            if (result.data.quote) {
              setQuote(result.data.quote.quote);
              setQuoteId(result.data.quote._id);
              setAuthor(result.data.quote.author);
            }
          } else {
            setMessage(result.error || "Erreur lors de l'ajout de la citation");
            clearMessageAfterDelay(3000);
          }
        } catch (error) {
          console.error('Error submitting pending quote:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    submitPendingQuote();
  }, [isAuthenticated, authLoading]);

  const fetchQuote = async () => {
    const result = await getQuote();

    if (result.success && result.data) {
      setQuote(result.data.quote);
      setQuoteId(result.data._id);
      setAuthor(result.data.author);
    } else {
      setMessage(result.error || "La citation n'a pas pu être affichée.");
      clearMessageAfterDelay(2000);
    }
  };
  useEffect(() => {
    fetchQuote();
  }, []);

  const handleCreateQuote = async (event) => {
    event.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save the quote to localStorage before redirecting
      if (newQuote.trim()) {
        localStorage.setItem(PENDING_QUOTE_KEY, newQuote.trim());
      }
      navigate('/login');
      return;
    }

    setErrors({});
    setMessage('');

    const newErrors = {};
    if (!newQuote.trim()) {
      newErrors.quote = 'La citation ne peut pas être vide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await createQuote(newQuote);

      if (result.success) {
        // Success Message
        const successMessage =
          result.message || 'La citation a bien été ajoutée !';
        setMessage(successMessage);
        clearMessageAfterDelay(3000);
        // Display the newly created quote
        if (result.data.quote) {
          setQuote(result.data.quote.quote);
          setQuoteId(result.data.quote._id);
          setAuthor(result.data.quote.author);
        }
        // Form input reset
        setNewQuote('');
        setErrors({});
      } else {
        // Gérer les erreurs de validation (status 400)
        if (result.status === 400 && result.errors) {
          // Convertir le tableau d'erreurs en objet pour faciliter l'affichage
          const validationErrors = {};
          result.errors.forEach((err) => {
            validationErrors[err.field] = err.message;
          });
          setErrors(validationErrors);

          // Afficher le premier message d'erreur comme message général
          if (result.errors.length > 0) {
            setMessage(result.errors[0].message);
            clearMessageAfterDelay(3000);
          }
        } else {
          // Autres erreurs (500, etc.)
          const errorMessage =
            result.error || "La citation n'a pas pu être ajoutée";
          setMessage(errorMessage);
          clearMessageAfterDelay(3000);
        }
      }
    } catch (error) {
      console.log('Error add new quote:', error);
      setMessage('Erreur de connexion. Vérifiez votre connexion internet.');
      clearMessageAfterDelay(3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 flex flex-col">
        <QuoteDisplay quote={quote} quoteId={quoteId} author={author} onNewQuote={fetchQuote} />

        {isAuthenticated && user && !user.emailVerified && (
          <div className="mb-4 p-4 bg-orange-100 border border-orange-300 rounded-lg text-orange-800 text-sm">
            ⚠️ Votre email n'est pas encore vérifié. Vos citations ne seront
            visibles publiquement qu'après vérification. Consultez vos emails.
          </div>
        )}

        <QuoteForm
          newQuote={newQuote}
          onQuoteChange={setNewQuote}
          onSubmit={handleCreateQuote}
          message={message}
          errors={errors}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;
