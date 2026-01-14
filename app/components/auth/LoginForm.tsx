'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { useLoginForm } from '@/app/hooks/useLoginForm';
import { 
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  CheckCircleIcon,
} from '@/app/components/ui/AuthIcons';

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  } = useLoginForm({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    },
  });

  if (showSuccess) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircleIcon className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Bienvenido de nuevo!
        </h2>
        <p className="text-gray-400">
          Redirigiendo a la página principal...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error general */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <p className="text-red-400 text-sm text-center">{errors.general}</p>
        </div>
      )}

      {/* Email o Username */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Input
          type="text"
          name="emailOrUserName"
          label="Correo electrónico o nombre de usuario"
          value={formData.emailOrUserName}
          onChange={handleChange}
          error={errors.emailOrUserName}
          icon={<MailIcon className="w-5 h-5" />}
          autoComplete="username"
          required
        />
      </div>

      {/* Password */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Contraseña"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<LockIcon className="w-5 h-5" />}
          rightIcon={showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          autoComplete="current-password"
          required
        />
      </div>

      {/* Submit Button */}
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Iniciar sesión
        </Button>
      </div>

      {/* Register Link */}
      <div className="text-center animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <p className="text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link 
            href="/register" 
            className="text-primary hover:text-primary-light font-medium transition-colors"
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </form>
  );
}
