import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuoteDisplay = ({ quote, author, onNewQuote }) => {
  const authorDisplay = author || 'Auteur inconnu';
  const isAnonymous = !author || author === 'Anonymous' || author === 'Auteur inconnu';

  return (
    <>
      <div className="flex flex-col justify-center h-[250px] overflow-y-auto mb-6">
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
      </div>

      <div className="flex justify-center mb-10 flex-shrink-0">
        <button
          onClick={onNewQuote}
          className="px-6 py-3 text-lg font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          Nouvelle citation
        </button>
      </div>
    </>
  );
};

export default QuoteDisplay;
