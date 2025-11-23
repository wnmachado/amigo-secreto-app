'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OtpInput } from '@/components/ui/OtpInput';
import api from '@/services/httpClient';
import { useAuth } from '@/contexts/AuthContext';
import { handleValidationErrors, showSuccessToast } from '@/utils/errorHandler';

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleComplete = async (inputCode: string) => {
    setCode(inputCode);
    setError('');

    if (inputCode.length !== 6) return;

    await verifyCode(inputCode);
  };

  const verifyCode = async (codeToVerify: string) => {
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/verify-code", {
        email,
        code: codeToVerify,
      });
      const { token } = response.data;

      if (token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("amigo_secreto_token", token);
        }
        login(email, token);
        router.push('/dashboard');
      } else {
        setError('Código inválido. Tente novamente.');
        setCode('');
      }
    } catch (error) {
      handleValidationErrors(error);
      setError('Código inválido. Tente novamente.');
      setCode('');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      await api.post("/api/auth/request-code", { email });
      showSuccessToast('Código reenviado com sucesso!');
    } catch (error) {
      handleValidationErrors(error);
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Informe o código de 6 dígitos
          </h1>
          <p className="text-gray-600">
            Enviamos um código para <strong>{email}</strong>
          </p>
        </div>

        <Card>
          <div className="space-y-6">
            <OtpInput
              length={6}
              onComplete={handleComplete}
              error={error}
            />

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => verifyCode(code)}
                isLoading={isLoading}
                disabled={code.length !== 6}
                className="w-full"
              >
                Confirmar código
              </Button>

              <div className="flex gap-3 text-sm">
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium flex-1"
                >
                  Reenviar código
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="text-gray-600 hover:text-gray-700 font-medium flex-1"
                >
                  Trocar e-mail
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
