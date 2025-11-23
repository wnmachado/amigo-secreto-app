import Swal from "sweetalert2";

// Mapeamento de campos do backend para campos do frontend
const fieldMapping: Record<string, string> = {
  event_date: "date",
  min_value: "minValue",
  max_value: "maxValue",
  organizer_email: "email",
};

// Tradução de mensagens de erro comuns
const errorTranslations: Record<string, string> = {
  "The title field is required.": "O campo título é obrigatório.",
  "The event date field is required.": "O campo data do evento é obrigatório.",
  "The min value field is required.": "O campo valor mínimo é obrigatório.",
  "The max value field is required.": "O campo valor máximo é obrigatório.",
  "The organizer email field is required.":
    "O campo e-mail do organizador é obrigatório.",
  "The name field is required.": "O campo nome é obrigatório.",
};

/**
 * Traduz uma mensagem de erro do backend para português
 */
function translateError(message: string): string {
  return errorTranslations[message] || message;
}

/**
 * Trata erros de validação do backend e exibe via toast
 * @param error - Erro do Axios
 * @param setErrors - Função para atualizar erros do formulário (opcional)
 * @returns Objeto com erros mapeados para os campos do frontend
 */
export function handleValidationErrors(
  error: any,
  setErrors?: (errors: Record<string, string>) => void
): Record<string, string> {
  const frontendErrors: Record<string, string> = {};

  if (error.response?.data?.errors) {
    const backendErrors = error.response.data.errors;

    // Processar cada campo com erro
    Object.keys(backendErrors).forEach((backendField) => {
      // Mapear campo do backend para o frontend
      const frontendField = fieldMapping[backendField] || backendField;
      const errorMessages = backendErrors[backendField];

      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        // Pegar a primeira mensagem de erro e traduzir
        const translatedMessage = translateError(errorMessages[0]);
        frontendErrors[frontendField] = translatedMessage;
      }
    });

    // Atualizar erros do formulário se a função foi fornecida
    if (setErrors) {
      setErrors(frontendErrors);
    }

    // Exibir toast com mensagem geral
    const generalMessage =
      error.response.data.message ||
      "Por favor, corrija os erros no formulário.";

    Swal.fire({
      icon: "error",
      title: "Erro de validação",
      text: generalMessage,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
  } else {
    // Erro genérico (sem estrutura de validação)
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Ocorreu um erro. Tente novamente.";

    Swal.fire({
      icon: "error",
      title: "Erro",
      text: errorMessage,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
  }

  return frontendErrors;
}

/**
 * Exibe um toast de sucesso
 */
export function showSuccessToast(message: string) {
  Swal.fire({
    icon: "success",
    title: "Sucesso",
    text: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}

/**
 * Exibe um toast de informação
 */
export function showInfoToast(message: string) {
  Swal.fire({
    icon: "info",
    title: "Informação",
    text: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}
