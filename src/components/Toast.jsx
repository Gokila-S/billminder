// Custom Toast Notification System — no npm dependency needed.
// Provides toast(), toast.success(), toast.error() and a <Toaster /> component.

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

let toastId = 0;
let addToastGlobal = null; // global reference for imperative toast() calls

// ─── Toaster Provider ────────────────────────────────────────────
export function Toaster({ position = 'bottom-center' }) {
  const [toasts, setToasts] = useState([]);

  // Expose addToast globally so the imperative `toast()` function works
  useEffect(() => {
    addToastGlobal = (t) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { ...t, id }]);

      if (t.duration !== Infinity) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== id));
        }, t.duration || 4000);
      }
      return id;
    };
    return () => { addToastGlobal = null; };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Position classes
  const posMap = {
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
    'bottom-right': 'bottom-6 right-6',
  };

  return (
    <div className={`fixed z-[9999] flex flex-col gap-3 ${posMap[position] || posMap['bottom-center']} pointer-events-none`}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm min-w-[280px] max-w-[420px] animate-slideUp ${
            t.type === 'success' ? 'bg-green-100 text-green-900' :
            t.type === 'error' ? 'bg-red-100 text-red-900' :
            'bg-white text-black'
          }`}
        >
          {/* Icon */}
          {t.type === 'success' && (
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          )}
          {t.type === 'error' && (
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          )}
          {t.type === 'custom' && t.icon && <span className="flex-shrink-0">{t.icon}</span>}

          {/* Content */}
          <div className="flex-1">
            {typeof t.message === 'function'
              ? t.message({ id: t.id, dismiss: () => dismiss(t.id) })
              : t.message}
          </div>

          {/* Close */}
          <button onClick={() => dismiss(t.id)} className="ml-2 opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Imperative toast API ────────────────────────────────────────
function toast(message, opts = {}) {
  if (!addToastGlobal) return;
  return addToastGlobal({ message, type: 'custom', ...opts });
}

toast.success = (message, opts = {}) => {
  if (!addToastGlobal) return;
  return addToastGlobal({ message, type: 'success', duration: 3000, ...opts });
};

toast.error = (message, opts = {}) => {
  if (!addToastGlobal) return;
  return addToastGlobal({ message, type: 'error', duration: 4000, ...opts });
};

toast.dismiss = (id) => {
  // Will remove via the Toaster's dismiss
  // For simplicity, trigger a custom event or store method.
  // Since we can't easily reach into Toaster state from here,
  // we won't support dismiss-by-id from outside. The undo pattern
  // will work via the render-function approach instead.
};

export { toast };
