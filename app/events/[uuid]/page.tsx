"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/httpClient";
import { Event, Participant, SecretFriendPair } from "@/types";
import {
  handleValidationErrors,
  showInfoToast,
  showSuccessToast,
} from "@/utils/errorHandler";
import useFetch from "@/hooks/useFetch";
import useSWR from "swr";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, userEmail } = useAuth();
  const eventUUID = params.uuid as string;

  const [showDrawModal, setShowDrawModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [newParticipant, setNewParticipant] = useState({
    name: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useFetch<Event>({
    url: `/api/events/${eventUUID}`,
  });

  const { data: participantsData, isLoading: isLoadingParticipants } = useFetch<
    Participant[]
  >({
    url: `/api/events/${eventUUID}/participants`,
  });

  const { mutate: mutateEvent } = useSWR(`/api/events/${eventUUID}`);
  const { mutate: mutateParticipants } = useSWR(
    `/api/events/${eventUUID}/participants`
  );

  const event = useMemo(() => {
    if (!eventData) return null;

    const rawPairs =
      (eventData as any).secret_friend_pairs || (eventData as any).pairs || [];

    const mappedPairs: SecretFriendPair[] = Array.isArray(rawPairs)
      ? rawPairs.map((pair: any) => ({
          ...pair,
          giver: pair.giver || pair.participant_giver || pair.giverParticipant,
          receiver:
            pair.receiver ||
            pair.participant_receiver ||
            pair.receiverParticipant,
        }))
      : [];

    const drawResultsCount =
      eventData.draw_results_count ?? mappedPairs.length ?? 0;

    const drawPerformed =
      (!eventData.draw_results_count && drawResultsCount > 0) ??
      ((eventData as any).status === "draw_done" || drawResultsCount > 0);

    const drawDate =
      eventData.drawDate ||
      (eventData as any).draw_date ||
      (drawPerformed ? (eventData as any).updated_at : undefined);

    return {
      ...eventData,
      uuid: eventData.uuid || (eventData as any).id,
      date: eventData.date || (eventData as any).event_date,
      min_value: Number(
        eventData.min_value || (eventData as any).min_value || 0
      ),
      max_value: Number(
        eventData.max_value || (eventData as any).max_value || 0
      ),
      drawPerformed,
      drawDate,
      secret_friend_pairs: mappedPairs,
      draw_results_count: drawResultsCount,
    } as Event;
  }, [eventData]);

  // Processar participantes
  const participants = useMemo(() => {
    if (!participantsData) return [];
    if (Array.isArray(participantsData)) return participantsData;
    return (participantsData as any)?.data || [];
  }, [participantsData]);

  // Processar pares do sorteio
  const pairs = useMemo(() => {
    return event?.secret_friend_pairs || [];
  }, [event]);

  const isLoading = isLoadingEvent || isLoadingParticipants;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (eventError && !isLoadingEvent) {
      alert("Evento não encontrado");
      router.push("/dashboard");
    }
  }, [isAuthenticated, eventError, isLoadingEvent, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatWhatsApp = (whatsapp: string) => {
    // Formatação simples: (XX) XXXXX-XXXX
    const cleaned = whatsapp.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return whatsapp;
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (event?.drawPerformed) {
      showInfoToast("Não é possível adicionar participantes após o sorteio.");
      return;
    }

    if (!newParticipant.name.trim()) {
      setErrors({ name: "Nome é obrigatório" });
      return;
    }

    setIsAdding(true);

    try {
      await api.post(`/api/events/${eventUUID}/participants`, {
        name: newParticipant.name,
      });

      setNewParticipant({ name: "" });
      mutateParticipants();
    } catch (error) {
      handleValidationErrors(error, setErrors);
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleConfirmation = async (
    participantId: string,
    confirmed: boolean
  ) => {
    if (event?.drawPerformed) {
      showInfoToast(
        "Não é possível alterar a confirmação após a realização do sorteio."
      );
      return;
    }

    try {
      await api.put(`/api/events/${eventUUID}/participants/${participantId}`, {
        confirmed: confirmed,
      });
      mutateParticipants();
    } catch (error) {
      handleValidationErrors(error);
      console.error(error);
    }
  };

  const handlePerformDraw = async () => {
    setIsDrawing(true);

    try {
      const response = await api.post(`/api/events/${eventUUID}/draw`);
      mutateEvent();
      mutateParticipants();
      setShowDrawModal(false);
      showSuccessToast("Sorteio realizado com sucesso!");
    } catch (error: any) {
      handleValidationErrors(error);
    } finally {
      setIsDrawing(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (event?.drawPerformed) {
      showInfoToast("Não é possível remover participantes após o sorteio.");
      return;
    }

    const confirmRemoval = window.confirm(
      "Tem certeza que deseja remover este participante?"
    );
    if (!confirmRemoval) return;

    try {
      await api.delete(
        `/api/events/${eventUUID}/participants/${participantId}`
      );
      showSuccessToast("Participante removido com sucesso!");
      mutateParticipants();
    } catch (error) {
      handleValidationErrors(error);
      console.error(error);
    }
  };

  if (!isAuthenticated || isLoading || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  const confirmed = participants.filter(
    (p: Participant) => p.is_confirmed
  ).length;
  const totalParticipants = participants.length;
  const canPerformDraw =
    totalParticipants >= 2 && confirmed === totalParticipants;
  const eventDateObj = new Date(event.date);
  const isDrawn = !!event.drawPerformed;
  const canShowResults = isDrawn && eventDateObj.getTime() <= Date.now();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {event.title}
              </h1>
              <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard")}
            >
              ← Voltar para o painel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do evento */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Informações do evento
              </h2>
              <p className="text-gray-600">
                {event.description || "Sem descrição"}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500">Valor mínimo</p>
                <p className="font-semibold">
                  {formatCurrency(event.min_value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor máximo</p>
                <p className="font-semibold">
                  {formatCurrency(event.max_value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de participantes</p>
                <p className="font-semibold">{participants.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confirmados</p>
                <p className="font-semibold">{confirmed}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Resumo do evento */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Status do sorteio</h3>
              <p className="text-gray-600">
                {isDrawn
                  ? `Sorteio realizado em ${
                      event.secret_friend_pairs &&
                      event.secret_friend_pairs.length > 0
                        ? formatDate(
                            new Date(
                              event.secret_friend_pairs[0].created_at
                            ).toISOString()
                          )
                        : "data não informada"
                    }`
                  : "Ainda não realizado"}
              </p>
            </div>
            {!isDrawn && (
              <Button
                variant="primary"
                onClick={() => setShowDrawModal(true)}
                disabled={!canPerformDraw}
              >
                Realizar sorteio
              </Button>
            )}
          </div>
          {!isDrawn && !canPerformDraw && (
            <p className="text-sm text-yellow-600 mt-2">
              Todos os participantes precisam confirmar presença para liberar o
              sorteio.
            </p>
          )}
        </Card>

        {/* Cadastro de participantes */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Adicionar participante</h3>
            <Button
              variant="outline"
              onClick={() => {
                const url = `${window.location.origin}/events/${eventUUID}/confirm`;
                navigator.clipboard.writeText(url);
                alert("Link copiado! Compartilhe com os participantes.");
              }}
              disabled={isDrawn}
              title={
                isDrawn
                  ? "O sorteio já foi realizado. Não é possível convidar novos participantes."
                  : undefined
              }
            >
              Copiar link de confirmação
            </Button>
          </div>
          {isDrawn && (
            <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              O sorteio já foi realizado. Não é mais possível adicionar ou
              remover participantes.
            </div>
          )}
          <form onSubmit={handleAddParticipant}>
            <fieldset
              disabled={isDrawn}
              className={`space-y-4 ${
                isDrawn ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <Input
                label="Nome"
                type="text"
                value={newParticipant.name}
                onChange={(e) =>
                  setNewParticipant({
                    name: e.target.value,
                  })
                }
                error={errors.name}
                placeholder="Nome completo"
                required
              />
              <p className="text-sm text-gray-500">
                💡 O participante receberá um link para informar seu WhatsApp e
                confirmar presença.
              </p>
              <Button type="submit" isLoading={isAdding} disabled={isDrawn}>
                Adicionar participante
              </Button>
            </fieldset>
          </form>
        </Card>

        {/* Lista de participantes */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Participantes</h3>
          {participants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum participante cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      WhatsApp
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Confirmado
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant: Participant) => (
                    <tr
                      key={participant.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{participant.name}</td>
                      <td className="py-3 px-4">
                        {participant.whatsapp_number
                          ? formatWhatsApp(participant.whatsapp_number)
                          : "Não informado"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {participant.is_confirmed ? (
                          <span className="text-green-600 font-medium">
                            ✓ Confirmado
                          </span>
                        ) : (
                          <span className="text-gray-400">Pendente</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="danger"
                          className="px-3 py-1 text-sm"
                          onClick={() =>
                            handleRemoveParticipant(participant.id)
                          }
                          disabled={isDrawn}
                          title={
                            isDrawn
                              ? "Participantes não podem ser removidos após o sorteio."
                              : undefined
                          }
                        >
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {isDrawn && (
            <p className="mt-4 text-sm text-yellow-700">
              Participantes não podem ser adicionados, removidos ou alterados
              após a realização do sorteio.
            </p>
          )}
        </Card>

        {/* Resultado do sorteio */}
        {canShowResults &&
          event.secret_friend_pairs &&
          event.secret_friend_pairs.length > 0 && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Resultado do sorteio
              </h3>
              <div className="space-y-3">
                {event.secret_friend_pairs.map((pair, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                  >
                    <p className="font-medium text-gray-900">
                      <span className="text-blue-600">{pair.giver.name}</span>
                      {" → tirou → "}
                      <span className="text-blue-600">
                        {pair.receiver.name}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                💡 <strong>Nota:</strong> Em produção, os participantes
                receberiam automaticamente uma mensagem no WhatsApp com o nome
                do seu amigo secreto.
              </p>
            </Card>
          )}
        {!canShowResults && event.draw_results_count && (
          <Card className="mt-6 bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Os resultados do sorteio ficarão disponíveis a partir da data do
              evento.
            </p>
          </Card>
        )}
      </main>

      {/* Modal de confirmação de sorteio */}
      <Modal
        isOpen={showDrawModal}
        onClose={() => setShowDrawModal(false)}
        title="Confirmar sorteio"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDrawModal(false)}
              disabled={isDrawing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePerformDraw}
              isLoading={isDrawing}
              disabled={!canPerformDraw || isDrawing}
            >
              Confirmar e realizar sorteio
            </Button>
          </>
        }
      >
        <p className="text-gray-700 mb-4">
          Tem certeza que deseja realizar o sorteio?
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Após confirmar, os pares serão definidos e não poderão ser alterados.
        </p>
        <p className="text-gray-600 text-sm">
          <strong>Participantes confirmados:</strong> {confirmed} de{" "}
          {participants.length}
        </p>
        {confirmed !== totalParticipants && (
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Todos os participantes precisam confirmar presença para realizar
            o sorteio.
          </p>
        )}
      </Modal>
    </div>
  );
}
