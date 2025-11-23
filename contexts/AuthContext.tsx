"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  token: string | null;
  login: (email: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "amigo_secreto_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Carregar estado de autenticação do localStorage ao montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Primeiro, tentar carregar do objeto de autenticação completo
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.email && parsed.token) {
            setUserEmail(parsed.email);
            setToken(parsed.token);
            setIsAuthenticated(true);
            // Garantir que o token também está salvo separadamente
            localStorage.setItem("amigo_secreto_token", parsed.token);
            return;
          }
        } catch (e) {
          // Dados inválidos, limpar
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }

      // Se não encontrou no objeto, verificar se há token direto no localStorage
      const token = localStorage.getItem("amigo_secreto_token");
      if (token) {
        // Se há token mas não há email, tentar buscar do backend ou manter apenas o token
        // Por enquanto, vamos apenas setar o token e marcar como autenticado
        // O email pode ser recuperado do backend se necessário
        setToken(token);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const login = (email: string, token: string) => {
    setUserEmail(email);
    setToken(token);
    setIsAuthenticated(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email, token }));
      localStorage.setItem("amigo_secreto_token", token);
    }
  };

  const logout = () => {
    setUserEmail(null);
    setToken(null);
    setIsAuthenticated(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("amigo_secreto_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userEmail, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
