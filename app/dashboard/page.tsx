"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { EventForm } from "@/components/EventForm";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/httpClient";
import { Event } from "@/types";
import { handleValidationErrors, showSuccessToast } from "@/utils/errorHandler";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userEmail, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/events");

      let eventsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      eventsData = eventsData.map((event: any) => ({
        ...event,
        uuid: event.uuid || event.id,
        date: event.date || event.event_date,
        email: event.email || event.organizer_email,
        min_value: event.min_value || event.min_value,
        max_value: event.max_value || event.max_value,
      }));

      setEvents(eventsData);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userEmail) {
      router.push("/login");
      return;
    }

    loadEvents();
  }, [isAuthenticated, userEmail, router, loadEvents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDelete = async (event: Event) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: `Deseja realmente excluir o evento "${event.title}"? Esta ação não pode ser desfeita.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/events/${event.uuid}`);
        showSuccessToast("Evento excluído com sucesso!");
        loadEvents();
      } catch (error) {
        handleValidationErrors(error);
      }
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setEditingEvent(null);
    setShowEventModal(false);
  };

  const handleSubmit = async (formData: {
    title: string;
    event_date: string;
    min_value: string;
    max_value: string;
    description: string;
  }) => {
    if (!userEmail) return;

    setIsSaving(true);
    try {
      const eventData = {
        title: formData.title,
        event_date: formData.event_date,
        min_value: parseFloat(formData.min_value),
        max_value: parseFloat(formData.max_value),
        description: formData.description,
        email: userEmail,
      };

      if (editingEvent?.uuid) {
        await api.put(`/api/events/${editingEvent.uuid}`, eventData);
        showSuccessToast("Evento atualizado com sucesso!");
      } else {
        await api.post("/api/events", eventData);
        showSuccessToast("Evento criado com sucesso!");
      }

      handleCloseModal();
      loadEvents();
    } catch (error) {
      handleValidationErrors(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReminder = async (eventUuid: string) => {
    const result = await Swal.fire({
      title: "Enviar recordatório?",
      text: "Deseja reenviar a notificação de recordatório de sugestão de presente para todos os participantes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, enviar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setSendingReminder(eventUuid);
      try {
        await api.post(`/api/events/${eventUuid}/participants/send-sugestions-reminder`);
        showSuccessToast("Recordatório enviado com sucesso!");
      } catch (error) {
        handleValidationErrors(error);
      } finally {
        setSendingReminder(null);
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus eventos</h1>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleOpenCreateModal}>
                Criar novo evento
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">
                Você ainda não tem eventos.
              </p>
              <p className="text-gray-500 mb-6">
                Crie o seu primeiro amigo secreto!
              </p>
              <Button onClick={handleOpenCreateModal}>Criar evento</Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const confirmedCount = event.confirmed_participants_count ?? 0;
              const drawCount = event.draw_results_count ?? 0;

              let statusLabel = "Em preparação";
              let statusColor = "text-yellow-600";

              if (drawCount > 0) {
                statusLabel = "Sorteio realizado";
                statusColor = "text-green-600";
              } else if (confirmedCount > 0) {
                statusLabel = "Presença confirmada";
                statusColor = "text-blue-600";
              }

              return (
                <Card
                  key={event.uuid}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium">
                          {formatCurrency(event.min_value)} -{" "}
                          {formatCurrency(event.max_value)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => router.push(`/events/${event.uuid}`)}
                          className="flex-1"
                        >
                          Gerenciar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(event)}
                          className="px-3"
                          title="Editar evento"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(event)}
                          className="px-3"
                          title="Excluir evento"
                        >
                          🗑️
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleSendReminder(event.uuid)}
                        disabled={sendingReminder === event.uuid}
                        isLoading={sendingReminder === event.uuid}
                        className="w-full text-sm"
                        title="Reenviar recordatório de sugestão de presente"
                      >
                        📧 Reenviar recordatório
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal unificado de criação/edição */}
      <Modal
        isOpen={showEventModal}
        onClose={handleCloseModal}
        title={editingEvent ? "Editar evento" : "Criar novo evento"}
      >
        <EventForm
          initialData={editingEvent}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSaving}
          submitButtonText={editingEvent ? "Salvar alterações" : "Criar evento"}
        />
      </Modal>
    </div>
  );
}
