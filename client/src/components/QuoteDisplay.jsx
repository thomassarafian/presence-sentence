import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getMeditation, generateMeditation } from '../services/meditationService';

const QuoteDisplay = ({ quote, quoteId, author, onNewQuote }) => {
  const authorDisplay = author || 'Auteur inconnu';
  const isAnonymous = !author || author === 'Anonymous' || author === 'Auteur inconnu';

  const [meditation, setMeditation] = useState(null);
  const [meditationLoading, setMeditationLoading] = useState(false);
  const [meditationError, setMeditationError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [showMeditation, setShowMeditation] = useState(false);

  useEffect(() => {
    setMeditation(null);
    setMeditationError(null);
    setShowMeditation(false);

    if (quoteId) {
      checkExistingMeditation();
    }
  }, [quoteId]);

  const checkExistingMeditation = async () => {
    const result = await getMeditation(quoteId);
    if (result.success && result.data) {
      if (result.data.meditation) {
        setMeditation(result.data.meditation);
      }
      setRemaining(result.data.remaining);
    }
  };

  const handleGenerateMeditation = async () => {
    if (!quoteId) return;

    setMeditationLoading(true);
    setMeditationError(null);

    const result = await generateMeditation(quoteId);

    if (result.success && result.data) {
      setMeditation(result.data.meditation);
      setRemaining(result.data.remaining);
      setShowMeditation(true);
    } else {
      setMeditationError(result.error);
      if (result.data?.remaining !== undefined) {
        setRemaining(result.data.remaining);
      }
    }

    setMeditationLoading(false);
  };

  const handleNewQuote = () => {
    setShowMeditation(false);
    onNewQuote();
  };

  return (
    <>
      <div className="flex flex-col justify-center min-h-[250px] overflow-y-auto mb-6">
        <motion.h1
          key={`quote-${quote || 'empty'}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-slate-800 text-center"
        >
          "{quote || 'Loading...'}"
        </motion.h1>

        <p
          key={`author-${author || 'empty'}`}
          className="text-lg text-slate-500 font-medium text-center mt-4"
        >
          —{' '}
          {isAnonymous ? (
            authorDisplay
          ) : (
            <Link
              to={`/auteur/${encodeURIComponent(author)}`}
              className="hover:text-indigo-600 hover:underline transition-colors"
            >
              {authorDisplay}
            </Link>
          )}
        </p>

        <AnimatePresence>
          {showMeditation && meditation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
            >
              <p className="text-sm font-medium text-indigo-600 mb-2">Méditation guidée</p>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{meditation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {meditationError && (
          <p className="mt-4 text-center text-red-500 text-sm">{meditationError}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 mb-10 flex-shrink-0">
        <div className="flex gap-3">
          <button
            onClick={handleNewQuote}
            className="px-6 py-3 text-lg font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            Nouvelle citation
          </button>

          {quoteId && (
            <button
              onClick={meditation ? () => setShowMeditation(!showMeditation) : handleGenerateMeditation}
              disabled={meditationLoading || (remaining === 0 && !meditation)}
              className={`px-6 py-3 text-lg font-semibold rounded-xl shadow-md transition-all duration-300 cursor-pointer
                ${meditation
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg'
                  : remaining === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg'
                }
                ${meditationLoading ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {meditationLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Génération...
                </span>
              ) : meditation ? (
                showMeditation ? 'Masquer' : 'Voir méditation'
              ) : (
                'Méditer'
              )}
            </button>
          )}
        </div>

        {remaining !== null && (
          <p className="text-sm text-slate-500">
            {remaining} génération{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''} aujourd'hui
          </p>
        )}
      </div>
    </>
  );
};

export default QuoteDisplay;
