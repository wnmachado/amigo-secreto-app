"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import api from "@/services/httpClient";
import { Event } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { handleValidationErrors, showSuccessToast } from "@/utils/errorHandler";

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirecionar para dashboard se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    event_date: "",
    minValue: "",
    maxValue: "",
    description: "",
    email: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Título é obrigatório";
    if (!formData.event_date) newErrors.event_date = "Data é obrigatória";
    if (!formData.minValue || parseFloat(formData.minValue) <= 0) {
      newErrors.minValue = "Valor mínimo deve ser maior que zero";
    }
    if (!formData.maxValue || parseFloat(formData.maxValue) <= 0) {
      newErrors.maxValue = "Valor máximo deve ser maior que zero";
    }
    if (parseFloat(formData.minValue) >= parseFloat(formData.maxValue)) {
      newErrors.maxValue = "Valor máximo deve ser maior que o mínimo";
    }
    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Criar evento
      await api.post("/api/events", {
        title: formData.title,
        event_date: formData.event_date,
        minValue: parseFloat(formData.minValue),
        maxValue: parseFloat(formData.maxValue),
        description: formData.description,
        email: formData.email,
      });

      // Enviar código
      await api.post("/api/auth/request-code", {
        email: formData.email,
      });

      setEmail(formData.email);
      setShowCodeModal(true);
    } catch (error) {
      handleValidationErrors(error, setErrors);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      alert("Por favor, informe o código de 6 dígitos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/verify-code", {
        email,
        code: code,
      });
      const { token } = response.data;

      if (token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("amigo_secreto_token", token);
        }
        login(email, token);
        router.push("/dashboard");
      } else {
        alert("Código inválido. Tente novamente.");
      }
    } catch (error) {
      handleValidationErrors(error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Não renderizar se estiver autenticado (será redirecionado)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              🎁 Amigo Secreto Online
            </h1>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Entrar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Crie seu evento de amigo secreto
          </h2>
          <p className="text-lg text-gray-600">
            Organize seu sorteio de forma fácil e prática
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Título do evento"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              error={errors.title}
              placeholder="Ex: Amigo Secreto de Natal 2024"
              required
            />

            <Input
              label="Data do evento"
              type="date"
              value={formData.event_date}
              onChange={(e) =>
                setFormData({ ...formData, event_date: e.target.value })
              }
              error={errors.event_date}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Valor mínimo (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formData.minValue}
                onChange={(e) =>
                  setFormData({ ...formData, minValue: e.target.value })
                }
                error={errors.minValue}
                placeholder="0.00"
                required
              />

              <Input
                label="Valor máximo (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formData.maxValue}
                onChange={(e) =>
                  setFormData({ ...formData, maxValue: e.target.value })
                }
                error={errors.maxValue}
                placeholder="0.00"
                required
              />
            </div>

            <Textarea
              label="Descrição do evento"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Adicione informações sobre o evento..."
            />

            <Input
              label="E-mail do organizador"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              placeholder="seu@email.com"
              required
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Criar evento
            </Button>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Já tem um evento?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Clique aqui para entrar
            </button>
          </p>
        </div>
      </main>

      {/* Modal de verificação de código */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Código enviado!</h3>
            <p className="text-gray-600 mb-4">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Por favor, verifique seu e-mail e informe o código abaixo.
            </p>
            <Input
              label="Código de 6 dígitos"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleVerifyCode}
                isLoading={isLoading}
                className="flex-1"
              >
                Confirmar código
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCodeModal(false);
                  setCode("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
