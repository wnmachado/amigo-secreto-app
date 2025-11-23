"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Event } from "@/types";

interface EventFormData {
  title: string;
  event_date: string;
  min_value: string;
  max_value: string;
  description: string;
}

interface EventFormProps {
  initialData?: Event | null;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = "Salvar",
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    event_date: "",
    min_value: "",
    max_value: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Formatar data para input type="date" (YYYY-MM-DD)
      const dateValue = initialData.date
        ? new Date(initialData.date).toISOString().split("T")[0]
        : "";

      setFormData({
        title: initialData.title || "",
        event_date: dateValue,
        min_value:
          initialData.min_value?.toString() ||
          initialData.min_value?.toString() ||
          "",
        max_value:
          initialData.max_value?.toString() ||
          initialData.max_value?.toString() ||
          "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Título é obrigatório";
    if (!formData.event_date) newErrors.event_date = "Data é obrigatória";
    if (!formData.min_value || parseFloat(formData.min_value) <= 0) {
      newErrors.min_value = "Valor mínimo deve ser maior que zero";
    }
    if (!formData.max_value || parseFloat(formData.max_value) <= 0) {
      newErrors.max_value = "Valor máximo deve ser maior que zero";
    }
    if (parseFloat(formData.min_value) >= parseFloat(formData.max_value)) {
      newErrors.max_value = "Valor máximo deve ser maior que o mínimo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Título do evento"
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          value={formData.min_value}
          onChange={(e) =>
            setFormData({ ...formData, min_value: e.target.value })
          }
          error={errors.min_value}
          placeholder="0.00"
          required
        />

        <Input
          label="Valor máximo (R$)"
          type="number"
          step="0.01"
          min="0"
          value={formData.max_value}
          onChange={(e) =>
            setFormData({ ...formData, max_value: e.target.value })
          }
          error={errors.max_value}
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

      <div className="flex gap-3">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {submitButtonText}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
