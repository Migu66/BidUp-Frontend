"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { AuthResponse } from "@/app/types";
import { refreshToken as refreshTokenApi } from "@/app/lib/api/auth";

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para decodificar JWT y obtener la expiración
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convertir a milisegundos
  } catch {
    return null;
  }
}

// Verificar si el token está por expirar (menos de 2 minutos)
function isTokenExpiringSoon(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  const bufferTime = 2 * 60 * 1000; // 2 minutos de buffer
  return Date.now() >= expiration - bufferTime;
}

// Verificar si el token ya expiró
function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return Date.now() >= expiration;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshPromise, setRefreshPromise] = useState<Promise<boolean> | null>(null);

  useEffect(() => {
    // Cargar datos del usuario desde localStorage al montar
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser) as AuthResponse;
        
        // Verificar si el token no ha expirado completamente
        if (!isTokenExpired(storedToken)) {
          setUser(userData);
        } else {
          // Token expirado, intentar refrescar
          const storedRefreshToken = localStorage.getItem("refreshToken");
          if (storedRefreshToken) {
            // Intentar refresh en segundo plano
            refreshTokenApi(storedRefreshToken)
              .then((newAuth) => {
                setUser(newAuth);
                localStorage.setItem("user", JSON.stringify(newAuth));
                localStorage.setItem("accessToken", newAuth.accessToken);
                localStorage.setItem("refreshToken", newAuth.refreshToken);
              })
              .catch(() => {
                // Refresh falló, limpiar todo
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
              });
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
  }, []);

  const login = useCallback((authData: AuthResponse) => {
    setUser(authData);
    localStorage.setItem("user", JSON.stringify(authData));
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("refreshToken", authData.refreshToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  // Función para refrescar el token
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    // Si ya hay un refresh en progreso, esperar a que termine
    if (refreshPromise) {
      return refreshPromise;
    }

    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      logout();
      return false;
    }

    setIsRefreshing(true);
    
    const promise = (async () => {
      try {
        const newAuth = await refreshTokenApi(storedRefreshToken);
        setUser(newAuth);
        localStorage.setItem("user", JSON.stringify(newAuth));
        localStorage.setItem("accessToken", newAuth.accessToken);
        localStorage.setItem("refreshToken", newAuth.refreshToken);
        return true;
      } catch (error) {
        console.error("Error refreshing token:", error);
        logout();
        return false;
      } finally {
        setIsRefreshing(false);
        setRefreshPromise(null);
      }
    })();

    setRefreshPromise(promise);
    return promise;
  }, [refreshPromise, logout]);

  // Función para obtener un token válido (refresca si es necesario)
  const getValidToken = useCallback(async (): Promise<string | null> => {
    const currentToken = user?.accessToken || localStorage.getItem("accessToken");
    
    if (!currentToken) {
      return null;
    }

    // Si el token está por expirar o ya expiró, intentar refrescar
    if (isTokenExpiringSoon(currentToken)) {
      const success = await refreshAuth();
      if (success) {
        return localStorage.getItem("accessToken");
      }
      return null;
    }

    return currentToken;
  }, [user?.accessToken, refreshAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isRefreshing,
        login,
        logout,
        refreshAuth,
        getValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
