// Tipos para autenticación - Basados en el backend de BidUp

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  emailOrUserName: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Tipos para validación del formulario
export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface PasswordStrength {
  score: number; // 0-5
  label: 'Muy débil' | 'Débil' | 'Regular' | 'Fuerte' | 'Muy fuerte';
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}
