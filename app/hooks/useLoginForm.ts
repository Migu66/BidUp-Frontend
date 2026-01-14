'use client';

import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import type { LoginRequest, ApiResponse, AuthResponse } from '@/app/types/auth';
import { login, AuthError } from '@/app/lib/api/auth';

export interface LoginFormErrors {
  emailOrUserName?: string;
  password?: string;
  general?: string;
}

interface UseLoginFormOptions {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: AuthError) => void;
}

const initialFormData: LoginRequest = {
  emailOrUserName: '',
  password: '',
};

function validateField(
  name: keyof LoginRequest,
  value: string
): string | undefined {
  switch (name) {
    case 'emailOrUserName':
      if (!value.trim()) return 'El email o nombre de usuario es requerido';
      return undefined;

    case 'password':
      if (!value) return 'La contraseña es requerida';
      return undefined;

    default:
      return undefined;
  }
}

export function useLoginForm(options: UseLoginFormOptions = {}) {
  const { onSuccess, onError } = options;

  const [formData, setFormData] = useState<LoginRequest>(initialFormData);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    setErrors(prev => {
      if (prev[name as keyof LoginFormErrors]) {
        return { ...prev, [name]: undefined, general: undefined };
      }
      if (prev.general) {
        return { ...prev, general: undefined };
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginFormErrors = {};
    
    const emailError = validateField('emailOrUserName', formData.emailOrUserName);
    if (emailError) newErrors.emailOrUserName = emailError;
    
    const passwordError = validateField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login(formData);
      onSuccess?.(response);
    } catch (error) {
      if (error instanceof AuthError) {
        setErrors({
          general: error.message,
        });
        onError?.(error);
      } else {
        setErrors({
          general: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onSuccess, onError]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
