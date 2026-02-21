import { Suspense } from 'react';
import LoginForm from '@/app/auth/components/LoginForm';

export const metadata = {
  title: 'Iniciar Sesión | Nephyx Network',
  description: 'Inicia sesión en tu cuenta de Nephyx Network',
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}