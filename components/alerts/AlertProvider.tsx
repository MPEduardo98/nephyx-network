'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

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
  error: (message: string, options?: Omit<AlertPayload, 'message' | 'type'>) => string;
  warning: (message: string, options?: Omit<AlertPayload, 'message' | 'type'>) => string;
  info: (message: string, options?: Omit<AlertPayload, 'message' | 'type'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const DEFAULT_DURATION = 4200;
const MAX_ALERTS = 5;

function getAlertIcon(type: AlertType) {
  if (type === 'success') return faCircleCheck;
  if (type === 'error') return faCircleXmark;
  if (type === 'warning') return faCircleExclamation;
  return faCircleInfo;
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const clearTimer = useCallback((id: string) => {
    const timeout = timeoutsRef.current[id];
    if (timeout) {
      clearTimeout(timeout);
      delete timeoutsRef.current[id];
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    clearTimer(id);
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, [clearTimer]);

  const clear = useCallback(() => {
    Object.keys(timeoutsRef.current).forEach(clearTimer);
    setAlerts([]);
  }, [clearTimer]);

  const notify = useCallback((payload: AlertPayload) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const alert: AlertItem = {
      id,
      title: payload.title,
      message: payload.message,
      type: payload.type ?? 'info',
      duration: payload.duration ?? DEFAULT_DURATION,
      persistent: payload.persistent ?? false,
      actionLabel: payload.actionLabel,
      onAction: payload.onAction,
    };

    setAlerts((prev) => {
      const next = [...prev];
      if (next.length >= MAX_ALERTS) {
        const removed = next.shift();
        if (removed) clearTimer(removed.id);
      }
      next.push(alert);
      return next;
    });

    if (!alert.persistent && alert.duration > 0) {
      timeoutsRef.current[id] = setTimeout(() => {
        dismiss(id);
      }, alert.duration);
    }

    return id;
  }, [clearTimer, dismiss]);

  const success = useCallback((message: string, options: Omit<AlertPayload, 'message' | 'type'> = {}) => {
    return notify({ ...options, message, type: 'success' });
  }, [notify]);

  const error = useCallback((message: string, options: Omit<AlertPayload, 'message' | 'type'> = {}) => {
    return notify({ ...options, message, type: 'error' });
  }, [notify]);

  const warning = useCallback((message: string, options: Omit<AlertPayload, 'message' | 'type'> = {}) => {
    return notify({ ...options, message, type: 'warning' });
  }, [notify]);

  const info = useCallback((message: string, options: Omit<AlertPayload, 'message' | 'type'> = {}) => {
    return notify({ ...options, message, type: 'info' });
  }, [notify]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      Object.keys(timeouts).forEach((id) => {
        clearTimeout(timeouts[id]);
      });
    };
  }, []);

  const value = useMemo<AlertContextValue>(() => ({
    notify,
    success,
    error,
    warning,
    info,
    dismiss,
    clear,
  }), [notify, success, error, warning, info, dismiss, clear]);

  return (
    <AlertContext.Provider value={value}>
      {children}

      <div className="alert-viewport" aria-live="polite" aria-atomic="false">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-toast alert-${alert.type}`}
            role={alert.type === 'error' || alert.type === 'warning' ? 'alert' : 'status'}
          >
            <div className="alert-icon">
              <FontAwesomeIcon icon={getAlertIcon(alert.type)} />
            </div>

            <div className="alert-content">
              {alert.title && <div className="alert-title">{alert.title}</div>}
              <p className="alert-message">{alert.message}</p>

              {alert.actionLabel && alert.onAction && (
                <button
                  type="button"
                  className="alert-action"
                  onClick={() => {
                    alert.onAction?.();
                    dismiss(alert.id);
                  }}
                >
                  {alert.actionLabel}
                </button>
              )}
            </div>

            <button
              type="button"
              className="alert-close"
              aria-label="Cerrar notificación"
              onClick={() => dismiss(alert.id)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert debe usarse dentro de <AlertProvider>.');
  }

  return context;
}
