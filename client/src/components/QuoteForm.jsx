const QuoteForm = ({
  newQuote,
  onQuoteChange,
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
            message.includes('bien') || message.includes('créée') ? 'text-green-600' : 'text-red-500'
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
          }}
          required
          type="text"
          placeholder="Entrez votre citation..."
          className={`w-full px-4 py-2.5 rounded-xl border ${
            errors.quote ? 'border-red-500' : 'border-slate-300'
          } focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none shadow-sm bg-white/80`}
        />
        {errors.quote && (
          <p className="text-red-500 text-sm mt-1">{errors.quote}</p>
        )}
      </div>

      <button
        disabled={loading}
        className="mt-2 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 cursor-pointer"
      >
        {loading ? 'Envoi...' : 'Ajouter ma citation'}
      </button>
    </form>
  );
};

export default QuoteForm;
