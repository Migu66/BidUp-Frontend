import type { Metadata } from 'next';
import { AuthLayout, LoginForm } from '@/app/components/auth';

export const metadata: Metadata = {
  title: 'Iniciar sesión | BidUp',
  description: 'Inicia sesión en BidUp y accede a subastas exclusivas en tiempo real.',
  openGraph: {
    title: 'Iniciar sesión | BidUp',
    description: 'Accede a tu cuenta y participa en subastas únicas.',
  },
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para continuar"
    >
      <LoginForm />
    </AuthLayout>
  );
}
