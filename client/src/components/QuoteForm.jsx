const QuoteForm = ({
  newQuote,
  newAuthor,
  onQuoteChange,
  onAuthorChange,
  onSubmit,
  message,
  errors,
  loading,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {message && (
        <p
          className={`text-center text-sm font-semibold ${
            message.includes('bien') ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {message}
        </p>
      )}

      <div>
        <label className="block text-slate-700 font-medium mb-1">
          Nouvelle citation
        </label>
        <input
          value={newQuote}
          onChange={(e) => {
            onQuoteChange(e.target.value);
            if (errors.quote) {
              // Gérer l'erreur si nécessaire
            }
          }}
          required
          type="text"
          className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none shadow-sm bg-white/80 ${
            errors.quote
              ? 'border-red-400 focus:ring-2 focus:ring-red-400'
              : 'border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'
          }`}
        />
        {errors.quote && (
          <p className="text-red-500 text-sm mt-1">{errors.quote}</p>
        )}
      </div>

      <div>
        <label className="block text-slate-700 font-medium mb-1">Auteur</label>
        <input
          value={newAuthor}
          onChange={(e) => onAuthorChange(e.target.value)}
          required
          type="text"
          className={`w-full px-4 py-2.5 rounded-xl border outline-none shadow-sm bg-white/80 ${
            errors.author
              ? 'border-red-400 focus:ring-2 focus:ring-red-400'
              : 'border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'
          }`}
        />
        {errors.author && (
          <p className="text-red-500 text-sm mt-1">{errors.author}</p>
        )}
      </div>

      <button
        disabled={loading}
        className="mt-2 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 cursor-pointer"
      >
        {loading ? 'Envoi...' : 'Ajouter cette citation'}
      </button>
    </form>
  );
};

export default QuoteForm;
