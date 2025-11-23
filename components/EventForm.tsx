"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Event } from "@/types";

interface EventFormData {
  title: string;
  event_date: string;
  minValue: string;
  maxValue: string;
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
    minValue: "",
    maxValue: "",
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
        minValue: initialData.min_value?.toString() || initialData.minValue?.toString() || "",
        maxValue: initialData.max_value?.toString() || initialData.maxValue?.toString() || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

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
