'use client';

import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import type { 
  RegisterRequest, 
  RegisterFormErrors, 
  PasswordStrength 
} from '@/app/types/auth';
import { register, AuthError } from '@/app/lib/api/auth';

interface UseRegisterFormOptions {
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

const initialFormData: RegisterRequest = {
  firstName: '',
  lastName: '',
  email: '',
  userName: '',
  password: '',
  confirmPassword: '',
};

function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;

  const strengthLevels: Array<{
    label: PasswordStrength['label'];
    color: string;
  }> = [
    { label: 'Muy débil', color: '#6b7280' },
    { label: 'Débil', color: '#ef4444' },
    { label: 'Regular', color: '#f97316' },
    { label: 'Fuerte', color: '#eab308' },
    { label: 'Muy fuerte', color: '#22c55e' },
    { label: 'Muy fuerte', color: '#22c55e' },
  ];

  const level = strengthLevels[metCount];

  return {
    score: metCount,
    label: level.label,
    color: level.color,
    requirements,
  };
}

function validateField(
  name: keyof RegisterRequest,
  value: string,
  formData: RegisterRequest
): string | undefined {
  switch (name) {
    case 'firstName':
      if (!value.trim()) return 'El nombre es requerido';
      if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
      if (value.length > 50) return 'El nombre no puede exceder 50 caracteres';
      return undefined;

    case 'lastName':
      if (!value.trim()) return 'El apellido es requerido';
      if (value.length < 2) return 'El apellido debe tener al menos 2 caracteres';
      if (value.length > 50) return 'El apellido no puede exceder 50 caracteres';
      return undefined;

    case 'email':
      if (!value.trim()) return 'El correo es requerido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'El formato del correo no es válido';
      }
      return undefined;

    case 'userName':
      if (!value.trim()) return 'El nombre de usuario es requerido';
      if (value.length < 3) return 'Debe tener al menos 3 caracteres';
      if (value.length > 30) return 'No puede exceder 30 caracteres';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'Solo letras, números y guiones bajos';
      }
      return undefined;

    case 'password':
      if (!value) return 'La contraseña es requerida';
      if (value.length < 8) return 'Mínimo 8 caracteres';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Debe incluir mayúscula, minúscula y número';
      }
      return undefined;

    case 'confirmPassword':
      if (!value) return 'Confirma tu contraseña';
      if (value !== formData.password) return 'Las contraseñas no coinciden';
      return undefined;

    default:
      return undefined;
  }
}

export function useRegisterForm(options: UseRegisterFormOptions = {}) {
  const { onSuccess, onError } = options;

  const [formData, setFormData] = useState<RegisterRequest>(initialFormData);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar en tiempo real solo si ya había un error
    setErrors(prev => {
      if (prev[name as keyof RegisterFormErrors]) {
        const error = validateField(
          name as keyof RegisterRequest, 
          value, 
          { ...formData, [name]: value }
        );
        return { ...prev, [name]: error };
      }
      return prev;
    });

    // Si cambia password, revalidar confirmPassword si tiene valor
    if (name === 'password' && formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value !== formData.confirmPassword 
          ? 'Las contraseñas no coinciden' 
          : undefined,
      }));
    }
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: RegisterFormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof RegisterRequest>).forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error instanceof AuthError) {
        if (error.errors && error.errors.length > 0) {
          // Mapear errores específicos a campos si es posible
          const fieldErrors: RegisterFormErrors = {};
          
          error.errors.forEach(err => {
            const lowerErr = err.toLowerCase();
            if (lowerErr.includes('email')) {
              fieldErrors.email = err;
            } else if (lowerErr.includes('usuario') || lowerErr.includes('username')) {
              fieldErrors.userName = err;
            } else if (lowerErr.includes('contraseña') || lowerErr.includes('password')) {
              fieldErrors.password = err;
            } else {
              // Agregar al mensaje general concatenando los errores
              fieldErrors.general = fieldErrors.general 
                ? `${fieldErrors.general}\n${err}`
                : err;
            }
          });

          // Si no se pudo mapear ningún error, usar mensaje general
          if (Object.keys(fieldErrors).length === 0) {
            fieldErrors.general = error.message;
          }

          setErrors(fieldErrors);
        } else {
          setErrors({ general: error.message });
        }
        onError?.(error);
      } else {
        // Error inesperado - proporcionar más información
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
        setErrors({ 
          general: errorMessage,
          email: 'Por favor, verifica los logs del backend para más detalles.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onSuccess, onError]);

  return {
    formData,
    errors,
    isLoading,
    passwordStrength,
    showPasswordStrength,
    handleChange,
    handleSubmit,
    setShowPasswordStrength,
  };
}
