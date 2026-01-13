import type { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  ApiResponse 
} from '@/app/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5240';

class AuthError extends Error {
  constructor(
    message: string,
    public errors?: string[],
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let data: ApiResponse<T>;
  
  // Verificar el Content-Type de la respuesta
  const contentType = response.headers.get('content-type');
  
  try {
    // Intentar parsear como JSON
    data = await response.json();
  } catch (error) {
    // Si falla, intentar leer como texto para diagnosticar
    let bodyText = '';
    try {
      bodyText = await response.clone().text();
      console.error('Respuesta del servidor (no JSON):', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        body: bodyText.substring(0, 500) // Primeros 500 caracteres
      });
    } catch (textError) {
      console.error('No se pudo leer el cuerpo de la respuesta');
    }
    
    throw new AuthError(
      `El servidor respondió con estado ${response.status} pero no devolvió JSON válido. Verifica que el backend esté configurado correctamente.`,
      [
        `Status: ${response.status} ${response.statusText}`,
        `Content-Type: ${contentType || 'no especificado'}`,
        bodyText ? `Respuesta: ${bodyText.substring(0, 100)}...` : 'Sin contenido'
      ],
      response.status
    );
  }
  
  if (!response.ok || !data.success) {
    throw new AuthError(
      data.message || 'Error en la solicitud',
      data.errors,
      response.status
    );
  }
  
  return data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  try {
    console.log('Enviando solicitud de registro a:', `${API_BASE_URL}/api/Auth/register`);
    console.log('Datos de registro:', {
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      userName: request.userName,
      passwordLength: request.password.length
    });
    
    const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await handleResponse<AuthResponse>(response);
    
    if (!result.data) {
      throw new AuthError('No se recibieron datos del servidor');
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // Error de red o conexión
    throw new AuthError(
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
      [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
    );
  }
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await handleResponse<AuthResponse>(response);
    
    if (!result.data) {
      throw new AuthError('No se recibieron datos del servidor');
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // Error de red o conexión
    throw new AuthError(
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
      [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
    );
  }
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/Auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const result = await handleResponse<AuthResponse>(response);
  
  if (!result.data) {
    throw new AuthError('No se recibieron datos del servidor');
  }
  
  return result.data;
}

export async function logout(refreshToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/Auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  await handleResponse(response);
}

export { AuthError };
