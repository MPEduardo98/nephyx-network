'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  faDiscord,
  faTwitch,
  faGoogle,
} from '@fortawesome/free-brands-svg-icons';
import { useAlert } from '@/components/alerts/AlertProvider';

export default function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: notifyError } = useAlert();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Muestra errores que vengan en el query string (?error=CredentialsSignin, etc.)
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (!errorParam) return;

    const message =
      errorParam === 'CredentialsSignin'
        ? 'Usuario o contraseña incorrectos'
        : 'No se pudo iniciar sesión. Inténtalo nuevamente.';

    setError(message);
    notifyError(message, { title: 'Error de autenticación' });
  }, [notifyError, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        login,
        password,
      });

      if (!result || result.error) {
        // En NextAuth v5 el error de credenciales inválidas es 'CredentialsSignin'
        const message =
          result?.error === 'CredentialsSignin' || result?.error === 'CallbackRouteError'
            ? 'Usuario o contraseña incorrectos'
            : 'No se pudo iniciar sesión. Intenta de nuevo.';
        setError(message);
        notifyError(message, { title: 'Error de autenticación' });
        return;
      }

      // Redirigir al callbackUrl si existe, sino a la raíz
      const callbackUrl = searchParams?.get('callbackUrl') ?? '/';
      success('Sesión iniciada correctamente.', { title: 'Bienvenido' });
      router.push(callbackUrl);
      router.refresh();
    } catch {
      const message = 'Ocurrió un error inesperado. Intenta de nuevo.';
      setError(message);
      notifyError(message, { title: 'Error de autenticación' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Bienvenido a Nephyx</h1>
          <p>Inicia sesión en tu cuenta para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Login Field */}
          <div className="form-group">
            <label htmlFor="login" className="form-label">
              <FontAwesomeIcon icon={faEnvelope} className="form-icon" />
              Usuario o correo
            </label>
            <input
              id="login"
              type="text"
              placeholder="usuario o correo"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="form-input"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FontAwesomeIcon icon={faLock} className="form-icon" />
              Contraseña
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="form-error" role="alert">{error}</div>}

          {/* Remember & Forgot */}
          <div className="form-footer">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Recuérdame</span>
            </label>
            <Link href="/auth/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>Iniciando sesión...</>
            ) : (
              <>
                Iniciar Sesión
                <FontAwesomeIcon icon={faArrowRight} className="btn-icon" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="form-divider">
          <span>O continúa con</span>
        </div>

        {/* Social Login */}
        <div className="social-login">
          <button type="button" className="social-btn" title="Iniciar con Discord">
            <FontAwesomeIcon icon={faDiscord} />
          </button>
          <button type="button" className="social-btn" title="Iniciar con Twitch">
            <FontAwesomeIcon icon={faTwitch} />
          </button>
          <button type="button" className="social-btn" title="Iniciar con Google">
            <FontAwesomeIcon icon={faGoogle} />
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="login-signup">
          <span>¿No tienes cuenta?</span>
          <Link href="/auth/register" className="signup-link">
            Crear una
          </Link>
        </div>
      </div>

      {/* Background decoration */}
      <div className="login-bg-decoration"></div>
    </div>
  );
}