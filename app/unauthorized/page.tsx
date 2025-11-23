'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <div className="space-y-6">
          <div className="text-6xl">🔒</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso não autorizado
            </h1>
            <p className="text-gray-600">
              Você precisa estar autenticado para acessar esta página.
            </p>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Ir para Login
          </Button>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Voltar para a página inicial
          </button>
        </div>
      </Card>
    </div>
  );
}
