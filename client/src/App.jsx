import { useState, useEffect, useRef } from 'react';
import { getQuote, createQuote } from './services/quoteService';
import QuoteDisplay from './components/QuoteDisplay';
import QuoteForm from './components/QuoteForm';

function App() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const timeoutRef = useRef(null);

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

  const fetchQuote = async () => {
    const result = await getQuote();

    if (result.success) {
      setQuote(result.data[0].quote);
      setAuthor(result.data[0].author);
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

    setErrors({});
    setMessage('');

    const newErrors = {};
    if (!newQuote.trim()) {
      newErrors.quote = 'La citation ne peut pas être vide';
    }
    if (!newAuthor.trim()) {
      newErrors.author = "L'auteur ne peut pas être vide";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await createQuote(newQuote, newAuthor);

      if (result.success) {
        // Success Message
        setMessage('La citation a bien été ajoutée !');
        clearMessageAfterDelay(2000);
        // Display
        setQuote(newQuote.trim());
        setAuthor(newAuthor.trim());
        // Form input reset
        setNewQuote('');
        setNewAuthor('');
        setErrors({});
      } else {
        const errorMessage =
          result.error || "La citation n'a pas pu être ajoutée";
        setMessage(errorMessage);
        clearMessageAfterDelay(3000);

        if (result.status === 400) {
          setErrors({
            quote: errorMessage.includes('quote') ? errorMessage : '',
            general: errorMessage,
          });
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
        <QuoteDisplay quote={quote} author={author} onNewQuote={fetchQuote} />
        <QuoteForm
          newQuote={newQuote}
          newAuthor={newAuthor}
          onQuoteChange={setNewQuote}
          onAuthorChange={setNewAuthor}
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
