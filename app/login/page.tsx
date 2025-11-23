"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import api from "@/services/httpClient";
import { useAuth } from "@/contexts/AuthContext";
import { handleValidationErrors } from "@/utils/errorHandler";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirecionar para dashboard se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Não renderizar se estiver autenticado (será redirecionado)
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Por favor, informe seu e-mail");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("E-mail inválido");
      return;
    }

    setIsLoading(true);

    try {
      await api
        .post("/api/auth/request-code", { email })
        .then((response) => {
          router.push(`/verify-code?email=${encodeURIComponent(email)}`);
        })
        .catch((error) => {
          handleValidationErrors(error);
          setError(error.response.data.errors.email[0]);
        });
    } catch (error: any) {
      handleValidationErrors(error);
      // Se houver erro de validação específico para email, atualizar o estado
      if (error.response?.data?.errors?.email) {
        setError(error.response.data.errors.email[0]);
      } else {
        setError("Erro ao enviar código. Tente novamente.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Entrar no painel
          </h1>
          <p className="text-gray-600">
            Informe seu e-mail para receber o código de acesso
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              placeholder="seu@email.com"
              required
              autoFocus
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Enviar código
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Voltar para a página inicial
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
