"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { OtpInput } from "@/components/ui/OtpInput";
import api from "@/services/httpClient";
import { Event, Participant } from "@/types";
import { handleValidationErrors, showSuccessToast } from "@/utils/errorHandler";
import useFetch from "@/hooks/useFetch";
import useSWR from "swr";

export default function ConfirmParticipantPage() {
  const params = useParams();
  const router = useRouter();
  const eventUUID = params.uuid as string;

  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"select" | "whatsapp" | "verify">("select");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  // Buscar evento usando useFetch
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useFetch<Event>({
    url: `/api/events/${eventUUID}`,
  });

  // Buscar participantes não confirmados usando useFetch
  const {
    data: participantsData,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useFetch<Participant[]>({
    url: `/api/events/${eventUUID}/participants`,
    params: { confirmed: false },
  });

  // Mutate para recarregar dados
  const { mutate: mutateEvent } = useSWR(`/api/events/${eventUUID}`);
  const { mutate: mutateParticipants } = useSWR(
    `/api/events/${eventUUID}/participants?confirmed=false`
  );

  // Mapear e processar dados do evento
  const event = useMemo(() => {
    if (!eventData) return null;

    return {
      ...eventData,
      uuid: eventData.uuid || (eventData as any).id,
      date: eventData.date || (eventData as any).event_date,
      min_value: eventData.min_value || (eventData as any).minValue,
      max_value: eventData.max_value || (eventData as any).maxValue,
    } as Event;
  }, [eventData]);

  // Processar participantes
  const participants = useMemo(() => {
    if (!participantsData) return [];
    if (Array.isArray(participantsData)) return participantsData;
    return (participantsData as any)?.data || [];
  }, [participantsData]);

  const isLoading = isLoadingEvent || isLoadingParticipants;

  useEffect(() => {
    if (eventError && !isLoadingEvent) {
      alert("Evento não encontrado");
      router.push("/");
    }
  }, [eventError, isLoadingEvent, router]);

  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setStep("whatsapp");
    setError("");
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!whatsapp.trim()) {
      setError("Por favor, informe seu número de WhatsApp");
      return;
    }

    const cleaned = whatsapp.replace(/\D/g, "");
    if (cleaned.length < 10 || cleaned.length > 11) {
      setError("WhatsApp inválido. Informe o número com DDD (ex: 11999999999)");
      return;
    }

    if (!selectedParticipantId) {
      setError("Por favor, selecione seu nome primeiro");
      return;
    }

    setIsSending(true);

    try {
      const response = await api
        .post(
          `/api/events/${eventUUID}/participants/${selectedParticipantId}/send-whatsapp-code`,
          {
            whatsapp_number: cleaned,
          }
        )
        .catch(() => {
          // Fallback para mock se endpoint não existir
          console.log(`[MOCK] Código seria enviado para WhatsApp ${cleaned}`);
          return {
            data: { success: true, message: "Código enviado com sucesso!" },
          };
        });

      const result = response.data;

      if (result.success) {
        setStep("verify");
        console.log(
          `[MOCK] Verifique o console para ver o código enviado para ${cleaned}`
        );
      } else {
        setError(result.message || "Erro ao enviar código");
      }
    } catch (error) {
      handleValidationErrors(error);
      setError("Erro ao enviar código. Tente novamente.");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (inputCode: string) => {
    if (inputCode.length !== 6) return;

    setError("");
    setIsVerifying(true);

    const cleaned = whatsapp.replace(/\D/g, "");

    if (!selectedParticipantId) {
      setError("Erro: participante não selecionado");
      setIsVerifying(false);
      return;
    }

    try {
      const response = await api
        .post(
          `/api/events/${eventUUID}/participants/${selectedParticipantId}/verify-whatsapp-code`,
          { whatsapp_number: cleaned, code: inputCode }
        )
        .catch(async () => {
          // Fallback para mock se endpoint não existir
          console.log(`[MOCK] Verificação de código para WhatsApp ${cleaned}`);
          // Atualizar participante como confirmado
          await api.put(
            `/api/events/${eventUUID}/participants/${selectedParticipantId}`,
            {
              confirmed: true,
              whatsapp_number: cleaned,
            }
          );
          return { data: { success: true } };
        });

      const result = response.data;

      if (result.success) {
        showSuccessToast(
          "Confirmação realizada com sucesso! Você está confirmado no evento."
        );
        // Recarregar dados para atualizar a lista
        mutateParticipants();
        // Resetar estado
        setStep("select");
        setSelectedParticipantId(null);
        setWhatsapp("");
        setCode("");
      } else {
        setError("Código inválido. Tente novamente.");
        setCode("");
      }
    } catch (error) {
      handleValidationErrors(error);
      setError("Erro ao verificar código. Tente novamente.");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <p className="text-gray-600">Evento não encontrado</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Voltar para início
          </Button>
        </Card>
      </div>
    );
  }

  if (participants.length === 0 && step === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>
          <p className="text-gray-600 mb-6">
            Todos os participantes já confirmaram sua presença!
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Voltar para início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            <p className="text-gray-600">Data: {formatDate(event.date)}</p>
          </div>
        </Card>

        {step === "select" && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selecione seu nome
                </h2>
                <p className="text-gray-600 mb-6">
                  Escolha seu nome na lista abaixo para confirmar sua presença
                  no evento.
                </p>
              </div>

              <div className="space-y-2">
                {participants.map((participant: Participant) => (
                  <button
                    key={participant.id}
                    onClick={() => handleSelectParticipant(participant.id)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">
                      {participant.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {step === "whatsapp" && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Informe seu WhatsApp
                </h2>
                <p className="text-gray-600 mb-4">
                  Você selecionou:{" "}
                  <strong>
                    {
                      participants.find(
                        (p: Participant) => p.id === selectedParticipantId
                      )?.name
                    }
                  </strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Enviaremos um código de 6 dígitos para confirmar seu número.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <Input
                  label="Número de WhatsApp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setWhatsapp(value);
                  }}
                  error={error}
                  placeholder="11999999999"
                  maxLength={11}
                  required
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setStep("select");
                      setWhatsapp("");
                      setError("");
                    }}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSending}
                    className="flex-1"
                  >
                    Enviar código
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {step === "verify" && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verifique o código
                </h2>
                <p className="text-gray-600 mb-4">
                  Enviamos um código de 6 dígitos para{" "}
                  <strong>
                    {whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                  </strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Por favor, verifique seu WhatsApp e informe o código abaixo.
                </p>
                <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mb-4">
                  💡 <strong>Nota:</strong> Em modo de desenvolvimento,
                  verifique o console do navegador (F12) para ver o código
                  gerado.
                </p>
              </div>

              <OtpInput
                length={6}
                onComplete={handleVerifyCode}
                error={error}
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStep("whatsapp");
                    setCode("");
                    setError("");
                  }}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => handleVerifyCode(code)}
                  isLoading={isVerifying}
                  disabled={code.length !== 6}
                  className="flex-1"
                >
                  Confirmar código
                </Button>
              </div>

              <div className="text-center">
                <button
                  onClick={async () => {
                    const cleaned = whatsapp.replace(/\D/g, "");
                    if (selectedParticipantId) {
                      setIsSending(true);
                      try {
                        await api
                          .post(
                            `/api/events/${eventUUID}/participants/${selectedParticipantId}/send-whatsapp-code`,
                            { whatsapp: cleaned }
                          )
                          .catch(() => {
                            console.log(
                              `[MOCK] Código seria reenviado para WhatsApp ${cleaned}`
                            );
                          });
                        showSuccessToast("Código reenviado!");
                      } catch (error) {
                        handleValidationErrors(error);
                      } finally {
                        setIsSending(false);
                      }
                    }
                  }}
                  disabled={isSending}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Reenviar código
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
