'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import PasswordStrengthIndicator from '@/app/components/ui/PasswordStrengthIndicator';
import { useRegisterForm } from '@/app/hooks/useRegisterForm';
import { 
  UserIcon, 
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  CheckCircleIcon,
  AtSignIcon
} from '@/app/components/ui/AuthIcons';

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    formData,
    errors,
    isLoading,
    passwordStrength,
    showPasswordStrength,
    handleChange,
    handleSubmit,
    setShowPasswordStrength,
  } = useRegisterForm({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
  });

  if (showSuccess) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircleIcon className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Cuenta creada con éxito!
        </h2>
        <p className="text-gray-400">
          Redirigiendo al inicio de sesión...
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

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Input
            type="text"
            name="firstName"
            label="Nombre"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            icon={<UserIcon className="w-5 h-5" />}
            autoComplete="given-name"
            required
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <Input
            type="text"
            name="lastName"
            label="Apellido"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            icon={<UserIcon className="w-5 h-5" />}
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Input
          type="email"
          name="email"
          label="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<MailIcon className="w-5 h-5" />}
          autoComplete="email"
          required
        />
      </div>

      {/* Username */}
      <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <Input
          type="text"
          name="userName"
          label="Nombre de usuario"
          value={formData.userName}
          onChange={handleChange}
          error={errors.userName}
          icon={<AtSignIcon className="w-5 h-5" />}
          autoComplete="username"
          required
        />
      </div>

      {/* Password */}
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Contraseña"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => setShowPasswordStrength(true)}
          error={errors.password}
          icon={<LockIcon className="w-5 h-5" />}
          rightIcon={showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthIndicator 
          strength={passwordStrength} 
          show={showPasswordStrength && formData.password.length > 0} 
        />
      </div>

      {/* Confirm Password */}
      <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          label="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<LockIcon className="w-5 h-5" />}
          rightIcon={showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          autoComplete="new-password"
          required
        />
      </div>

      {/* Terms */}
      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <p className="text-sm text-gray-400 text-center">
          Al registrarte, aceptas nuestros{' '}
          <Link href="/terms" className="text-primary hover:text-primary-light transition-colors">
            Términos de servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="text-primary hover:text-primary-light transition-colors">
            Política de privacidad
          </Link>
        </p>
      </div>

      {/* Submit Button */}
      <div className="animate-slide-up" style={{ animationDelay: '0.45s' }}>
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Crear cuenta
        </Button>
      </div>

      {/* Login Link */}
      <div className="text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <p className="text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link 
            href="/login" 
            className="text-primary hover:text-primary-light font-medium transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </form>
  );
}
