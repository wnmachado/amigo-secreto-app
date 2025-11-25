"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import api from "@/services/httpClient";
import { Event, Participant } from "@/types";
import { handleValidationErrors, showSuccessToast } from "@/utils/errorHandler";
import useFetch from "@/hooks/useFetch";

export default function UpdateGiftSuggestionPage() {
  const params = useParams();
  const router = useRouter();
  const eventUUID = params.uuid as string;

  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const [giftSuggestion, setGiftSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useFetch<Event>({
    url: `/api/events/${eventUUID}/confirmed`,
  });

  const { data: participantsData, isLoading: isLoadingParticipants } = useFetch<
    Participant[]
  >({
    url: `/api/events/${eventUUID}/confirmed/participants`,
    params: { confirmed: 1 },
  });

  const event = useMemo(() => {
    if (!eventData) return null;

    return {
      ...eventData,
      uuid: eventData.uuid || (eventData as any).id,
      date: eventData.date || (eventData as any).event_date,
    } as Event;
  }, [eventData]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setGiftSuggestion("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedParticipantId) {
      setError("Selecione seu nome antes de enviar a sugestão.");
      return;
    }

    if (!giftSuggestion.trim()) {
      setError("Descreva a nova sugestão de presente.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put(
        `/api/events/${eventUUID}/confirmed/participants/${selectedParticipantId}/change-git-sugestions`,
        {
          gift_suggestion: giftSuggestion.trim(),
        }
      );

      showSuccessToast("Sugestão atualizada com sucesso!");
      setSelectedParticipantId(null);
      setGiftSuggestion("");
    } catch (err) {
      handleValidationErrors(err);
      setError("Não foi possível atualizar sua sugestão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <p className="text-gray-600">Evento não encontrado</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Voltar para início
          </Button>
        </Card>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>
          <p className="text-gray-600 mb-6">
            Nenhum participante confirmado encontrado para este evento.
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Voltar para início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            <p className="text-gray-600">Data: {formatDate(event.date)}</p>
          </div>
          <p className="text-gray-600 text-center">
            Escolha seu nome e informe uma nova sugestão de presente. Essa
            informação será enviada diretamente para o organizador.
          </p>
        </Card>

        {!selectedParticipantId && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selecione seu nome
                </h2>
                <p className="text-gray-600 mb-6">
                  Apenas participantes confirmados podem atualizar a sugestão.
                </p>
              </div>

              <div className="space-y-2">
                {participants.map((participant: Participant) => (
                  <button
                    key={participant.id}
                    onClick={() => handleSelectParticipant(participant.id)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
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

        {selectedParticipantId && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Atualize sua sugestão
                </h2>
                <p className="text-gray-600">
                  Você selecionou:{" "}
                  <strong>
                    {
                      participants.find(
                        (p: Participant) => p.id === selectedParticipantId
                      )?.name
                    }
                  </strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  label="Nova sugestão de presente"
                  value={giftSuggestion}
                  onChange={(e) => setGiftSuggestion(e.target.value)}
                  placeholder="Descreva o presente ideal..."
                  rows={5}
                  required
                />
                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error}
                  </p>
                )}
                <div className="flex gap-3 flex-col sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSelectedParticipantId(null);
                      setGiftSuggestion("");
                      setError("");
                    }}
                    className="flex-1"
                  >
                    Escolher outro nome
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1"
                  >
                    Enviar sugestão
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
