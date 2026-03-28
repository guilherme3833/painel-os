export default function Toast({ toasts, onRemover }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-sm font-medium pointer-events-auto
            transition-all duration-300 animate-fade-up
            ${t.tipo === 'abertas'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
        >
          <span className="text-base">{t.tipo === 'abertas' ? '🔔' : '✅'}</span>
          <span>{t.mensagem}</span>
          <button
            onClick={() => onRemover(t.id)}
            className="ml-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
          >✕</button>
        </div>
      ))}
    </div>
  )
}
