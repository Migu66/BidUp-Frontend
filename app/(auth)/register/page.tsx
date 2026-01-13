import type { Metadata } from 'next';
import { AuthLayout, RegisterForm } from '@/app/components/auth';

export const metadata: Metadata = {
  title: 'Crear cuenta | BidUp',
  description: 'Regístrate en BidUp y comienza a participar en subastas exclusivas en tiempo real.',
  openGraph: {
    title: 'Crear cuenta | BidUp',
    description: 'Únete a la comunidad de coleccionistas y participa en subastas únicas.',
  },
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Únete a la comunidad de subastas más grande"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
