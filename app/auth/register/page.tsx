'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faGlobe,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
  faArrowLeft,
  faCheck,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useAlert } from '@/components/alerts/AlertProvider';
import Loader from '@/components/Loader';

type FormDataState = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  promos: boolean;
};

const countries = [
  // LAN - Latinoamérica Norte
  { code: 'MX', name: 'México' },
  { code: 'CO', name: 'Colombia' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'PE', name: 'Perú' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panamá' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'CU', name: 'Cuba' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'HT', name: 'Haití' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'TT', name: 'Trinidad y Tobago' },
  // LAS - Latinoamérica Sur
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'BR', name: 'Brasil' },
  // NA - Norteamérica
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  // España
  { code: 'ES', name: 'España' },
];

export default function RegisterPage() {
  const { success, warning, error } = useAlert();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataState>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    country: 'MX',
    password: '',
    confirmPassword: '',
    terms: false,
    promos: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const countryPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        countryPickerRef.current &&
        !countryPickerRef.current.contains(target)
      ) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateStep = (_currentStep: number) => true;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && (name === 'terms' || name === 'promos')) {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (
      name === 'username' ||
      name === 'email' ||
      name === 'firstName' ||
      name === 'lastName' ||
      name === 'password' ||
      name === 'confirmPassword'
    ) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = async () => {
    setIsSubmitting(true);
    const start = Date.now();
    try {
      if (step === 1) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 1,
            username: formData.username,
            email: formData.email,
          }),
        });
        const data = (await response.json()) as { message?: string };
        if (!response.ok) {
          error(data.message ?? 'Error al verificar los datos.', { title: 'Error' });
          return;
        }
      }

      if (step === 2) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 2,
            firstName: formData.firstName,
            lastName: formData.lastName,
            country: formData.country,
          }),
        });
        const data = (await response.json()) as { message?: string };
        if (!response.ok) {
          error(data.message ?? 'Error al verificar los datos.', { title: 'Error' });
          return;
        }
      }

      setStep((prev) => Math.min(prev + 1, 3));
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 500 - elapsed);
      await new Promise((res) => setTimeout(res, remaining));
      setIsSubmitting(false);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleCountrySelect = (code: string) => {
    setFormData((prev) => ({ ...prev, country: code }));
    setCountryDropdownOpen(false);
  };

  const handleSubmit = async () => {
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();
    const start = Date.now();

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 3,
          username: formData.username,
          email: formData.email,
          password,
          confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          country: formData.country,
          promos: formData.promos,
          terms: formData.terms,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = data.message ?? 'No se pudo completar el registro.';
        error(message, { title: 'Registro fallido' });
        return;
      }

      success('Tu cuenta fue creada correctamente.', {
        title: 'Registro completo',
      });

      // Iniciar sesión automáticamente
      await signIn('credentials', {
        login: formData.username,
        password,
        redirect: false,
      });

      router.push('/dashboard');
    } catch {
      error('Error de conexión con el servidor.', {
        title: 'Registro fallido',
      });
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 500 - elapsed);
      await new Promise((res) => setTimeout(res, remaining));
      setIsSubmitting(false);
    }
  };

  const selectedCountry =
    countries.find((c) => c.code === formData.country) ?? countries[0];

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '480px', position: 'relative' }}>
        {isSubmitting && <Loader />}
        <div className="login-header">
          <h1>Crear Cuenta</h1>
          <p>Únete a la comunidad de Nephyx Network</p>
        </div>

        {/* Progress Steps */}
        <div className="signup-steps">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faGlobe} />
          </div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faLock} />
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="login-form">
          {/* STEP 1: Usuario y Correo */}
          {step === 1 && (
            <div className="step-content">
              <div className="form-group">
                <label className="form-label">
                  <FontAwesomeIcon icon={faUser} className="form-icon" />
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Ej. NephyxPlayer"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <FontAwesomeIcon icon={faEnvelope} className="form-icon" />
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: Nombre, Apellido, País */}
          {step === 2 && (
            <div className="step-content">
              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Pérez"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FontAwesomeIcon icon={faGlobe} className="form-icon" />
                  País
                </label>
                <div className="country-field-row">
                  <div
                    className="country-flag-preview"
                    aria-label={`Bandera de ${selectedCountry.name}`}
                  >
                    <span
                      className={`fi fi-${selectedCountry.code.toLowerCase()} country-flag-preview-icon`}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="country-select" ref={countryPickerRef}>
                    <button
                      type="button"
                      className="form-input country-select-trigger"
                      onClick={() =>
                        setCountryDropdownOpen((prev) => !prev)
                      }
                      aria-haspopup="listbox"
                      aria-expanded={countryDropdownOpen}
                      disabled={isSubmitting}
                    >
                      <span className="country-option-left">
                        <span>{selectedCountry.name}</span>
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="country-chevron"
                      />
                    </button>

                    <ul
                      className={`country-options ${countryDropdownOpen ? 'open' : ''}`}
                      role="listbox"
                      aria-label="Selecciona tu país"
                      aria-hidden={!countryDropdownOpen}
                    >
                      {countries.map((country) => {
                        const isSelected = formData.country === country.code;
                        return (
                          <li key={country.code}>
                            <button
                              type="button"
                              className={`country-option-btn ${isSelected ? 'active' : ''}`}
                              onClick={() =>
                                handleCountrySelect(country.code)
                              }
                              disabled={isSubmitting}
                            >
                              <span>{country.name}</span>
                              {isSelected && (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="country-check-icon"
                                />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Password + Terms */}
          {step === 3 && (
            <div className="step-content">
              <div className="form-group">
                <label className="form-label">
                  <FontAwesomeIcon icon={faLock} className="form-icon" />
                  Contraseña
                </label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="password-toggle"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>

              <div
                className="form-footer"
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                  <span>
                    Acepto los{' '}
                    <Link href="/terminos" className="link-hover">
                      Términos y Condiciones
                    </Link>
                  </span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="promos"
                    checked={formData.promos}
                    onChange={handleChange}
                  />
                  <span>Recibir noticias y alertas de torneos</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className="form-actions"
            style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}
          >
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  style={{ marginRight: '0.5rem' }}
                />
                Atrás
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                Siguiente
                <FontAwesomeIcon
                  icon={faArrowRight}
                  style={{ marginLeft: '0.5rem' }}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                {!isSubmitting && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    style={{ marginLeft: '0.5rem' }}
                  />
                )}
              </button>
            )}
          </div>
        </form>

        <div className="login-signup">
          <span>¿Ya tienes cuenta?</span>
          <Link href="/auth/login" className="signup-link">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}