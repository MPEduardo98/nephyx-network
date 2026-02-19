'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type AlertPayload = {
  title?: string;
  message: string;
  type?: AlertType;
  duration?: number;
  persistent?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

type AlertItem = {
  id: string;
  title?: string;
  message: string;
  type: AlertType;
  duration: number;
  persistent: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

type AlertContextValue = {
  notify: (payload: AlertPayload) => string;
  success: (message: string, options?: Omit<AlertPayload, 'message' | 'type'>) => string;
  error:   (message: string, options?: Omit<AlertPayload, 'message' | 'type'>) => string;
  warning: (message: string, options?: Omit<AlertPayload, 'message' | 'type'>) => string;
  info:    (message: string, options?: Omit<AlertPayload, 'message' | 'type'>) => string;
  dismiss: (id: string) => void;
  clear:   () => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const DEFAULT_DURATION = 4500;
const EXIT_DURATION    = 380; // ms — debe coincidir con la animación CSS
const MAX_ALERTS       = 5;

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconSuccess() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="alert-svg">
      <circle cx="12" cy="12" r="10" className="alert-svg-circle" />
      <polyline points="6.5,12 10,15.5 17.5,8" className="alert-svg-check" />
    </svg>
  );
}
function IconError() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="alert-svg">
      <circle cx="12" cy="12" r="10" className="alert-svg-circle" />
      <line x1="8" y1="8" x2="16" y2="16" className="alert-svg-cross" />
      <line x1="16" y1="8" x2="8" y2="16" className="alert-svg-cross" />
    </svg>
  );
}
function IconWarning() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="alert-svg">
      <path d="M12 3L22 21H2L12 3Z" className="alert-svg-triangle" />
      <line x1="12" y1="10" x2="12" y2="15" className="alert-svg-exclaim" />
      <circle cx="12" cy="18.5" r="1" className="alert-svg-dot" />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="alert-svg">
      <circle cx="12" cy="12" r="10" className="alert-svg-circle" />
      <circle cx="12" cy="8" r="1" className="alert-svg-dot" />
      <line x1="12" y1="11" x2="12" y2="17" className="alert-svg-exclaim" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="alert-close-svg">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
function getIcon(type: AlertType) {
  if (type === 'success') return <IconSuccess />;
  if (type === 'error')   return <IconError />;
  if (type === 'warning') return <IconWarning />;
  return <IconInfo />;
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ duration, paused }: { duration: number; paused: boolean }) {
  return (
    <div className="alert-progress-track">
      <div
        className="alert-progress-fill"
        style={{
          animationDuration: `${duration}ms`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </div>
  );
}

// ── Toast individual ──────────────────────────────────────────────────────────
// El timer vive AQUÍ, no en el provider.
// Así podemos reproducir la animación de salida antes de eliminar del DOM.

function AlertToast({
  alert,
  onRemove,
}: {
  alert: AlertItem;
  onRemove: (id: string) => void;
}) {
  const [hovered,  setHovered]  = useState(false);
  const [exiting,  setExiting]  = useState(false);
  const exitingRef = useRef(false);
  const hoveredRef = useRef(false);

  // Sincroniza hoveredRef para usarlo dentro del timeout sin re-render
  useEffect(() => { hoveredRef.current = hovered; }, [hovered]);

  // Dispara la animación de salida y luego elimina del DOM
  const triggerExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setTimeout(() => onRemove(alert.id), EXIT_DURATION);
  }, [alert.id, onRemove]);

  // Timer propio del toast — se pausa si está en hover
  useEffect(() => {
    if (alert.persistent) return;

    let remaining = alert.duration;
    let start     = Date.now();
    let timerId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timerId = setTimeout(() => {
        // Si sigue en hover, re-agenda en 200ms
        if (hoveredRef.current) {
          remaining = 200;
          start = Date.now();
          schedule();
        } else {
          triggerExit();
        }
      }, remaining);
    };

    // Pausa/reanuda según hover
    const handleVisibility = () => {
      if (hoveredRef.current) {
        // Pausa: guarda tiempo restante
        remaining -= Date.now() - start;
        clearTimeout(timerId);
      } else {
        // Reanuda
        start = Date.now();
        schedule();
      }
    };

    schedule();
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`alert-toast alert-${alert.type}${exiting ? ' alert-exit' : ''}`}
      role={alert.type === 'error' || alert.type === 'warning' ? 'alert' : 'status'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="alert-icon">{getIcon(alert.type)}</div>

      <div className="alert-content">
        {alert.title && <div className="alert-title">{alert.title}</div>}
        <p className="alert-message">{alert.message}</p>
        {alert.actionLabel && alert.onAction && (
          <button
            type="button"
            className="alert-action"
            onClick={() => { alert.onAction?.(); triggerExit(); }}
          >
            {alert.actionLabel}
          </button>
        )}
      </div>

      <button
        type="button"
        className="alert-close"
        aria-label="Cerrar"
        onClick={triggerExit}
      >
        <IconClose />
      </button>

      {!alert.persistent && (
        <ProgressBar duration={alert.duration} paused={hovered} />
      )}
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // onRemove: elimina del array (lo llama el toast DESPUÉS de la animación)
  const remove = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // dismiss: dispara exit desde afuera — necesitamos una ref al método del toast.
  // Solución simple: marcamos el toast con una clase que dispara la animación
  // y lo eliminamos después. Lo hacemos mediante un estado "exiting" por id.
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setExitingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setExitingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }, EXIT_DURATION);
  }, []);

  const clear = useCallback(() => {
    setAlerts([]);
    setExitingIds(new Set());
  }, []);

  const notify = useCallback((payload: AlertPayload): string => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const item: AlertItem = {
      id,
      title:       payload.title,
      message:     payload.message,
      type:        payload.type     ?? 'info',
      duration:    payload.duration ?? DEFAULT_DURATION,
      persistent:  payload.persistent ?? false,
      actionLabel: payload.actionLabel,
      onAction:    payload.onAction,
    };

    setAlerts((prev) => {
      const next = [...prev];
      if (next.length >= MAX_ALERTS) next.shift();
      next.push(item);
      return next;
    });

    return id;
  }, []);

  const success = useCallback((m: string, o: Omit<AlertPayload,'message'|'type'> = {}) => notify({ ...o, message: m, type: 'success' }), [notify]);
  const error   = useCallback((m: string, o: Omit<AlertPayload,'message'|'type'> = {}) => notify({ ...o, message: m, type: 'error'   }), [notify]);
  const warning = useCallback((m: string, o: Omit<AlertPayload,'message'|'type'> = {}) => notify({ ...o, message: m, type: 'warning' }), [notify]);
  const info    = useCallback((m: string, o: Omit<AlertPayload,'message'|'type'> = {}) => notify({ ...o, message: m, type: 'info'    }), [notify]);

  const value = useMemo<AlertContextValue>(
    () => ({ notify, success, error, warning, info, dismiss, clear }),
    [notify, success, error, warning, info, dismiss, clear]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="alert-viewport" aria-live="polite" aria-atomic="false">
        {alerts.map((alert) => (
          <AlertToast
            key={alert.id}
            alert={alert}
            onRemove={remove}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert debe usarse dentro de <AlertProvider>.');
  return ctx;
}