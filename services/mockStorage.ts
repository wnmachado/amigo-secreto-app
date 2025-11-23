// Serviço de armazenamento simulado usando localStorage
// TODO: Substituir por chamadas reais à API quando o backend estiver disponível

import { Evento, Participante, Usuario } from '@/types';

const STORAGE_KEYS = {
  EVENTOS: 'amigo_secreto_eventos',
  PARTICIPANTES: 'amigo_secreto_participantes',
  USUARIOS: 'amigo_secreto_usuarios',
  CODIGOS: 'amigo_secreto_codigos',
  CODIGOS_WHATSAPP: 'amigo_secreto_codigos_whatsapp',
};

// Gerenciamento de eventos
export const eventosStorage = {
  getAll: (): Evento[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EVENTOS);
    return data ? JSON.parse(data) : [];
  },

  getByEmail: (email: string): Evento[] => {
    const eventos = eventosStorage.getAll();
    return eventos.filter(e => e.emailOrganizador === email);
  },

  getById: (id: string): Evento | null => {
    const eventos = eventosStorage.getAll();
    return eventos.find(e => e.id === id) || null;
  },

  create: (evento: Omit<Evento, 'id' | 'sorteioRealizado'>): Evento => {
    const eventos = eventosStorage.getAll();
    const novoEvento: Evento = {
      ...evento,
      id: Date.now().toString(),
      sorteioRealizado: false,
    };
    eventos.push(novoEvento);
    localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
    return novoEvento;
  },

  update: (id: string, updates: Partial<Evento>): Evento | null => {
    const eventos = eventosStorage.getAll();
    const index = eventos.findIndex(e => e.id === id);
    if (index === -1) return null;
    eventos[index] = { ...eventos[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
    return eventos[index];
  },
};

// Gerenciamento de participantes
export const participantesStorage = {
  getAll: (): Participante[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTES);
    return data ? JSON.parse(data) : [];
  },

  getByEventoId: (eventoId: string): Participante[] => {
    const participantes = participantesStorage.getAll();
    return participantes.filter(p => p.eventoId === eventoId);
  },

  getById: (id: string): Participante | null => {
    const participantes = participantesStorage.getAll();
    return participantes.find(p => p.id === id) || null;
  },

  create: (participante: Omit<Participante, 'id' | 'confirmado'>): Participante => {
    const participantes = participantesStorage.getAll();
    const novoParticipante: Participante = {
      ...participante,
      id: Date.now().toString(),
      confirmado: false,
    };
    participantes.push(novoParticipante);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTES, JSON.stringify(participantes));
    return novoParticipante;
  },

  update: (id: string, updates: Partial<Participante>): Participante | null => {
    const participantes = participantesStorage.getAll();
    const index = participantes.findIndex(p => p.id === id);
    if (index === -1) return null;
    participantes[index] = { ...participantes[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTES, JSON.stringify(participantes));
    return participantes[index];
  },

  delete: (id: string): boolean => {
    const participantes = participantesStorage.getAll();
    const filtered = participantes.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTES, JSON.stringify(filtered));
    return filtered.length < participantes.length;
  },
};

// Gerenciamento de códigos de verificação
export const codigosStorage = {
  generate: (email: string): string => {
    // Gera código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    if (typeof window === 'undefined') return codigo;

    const codigos = codigosStorage.getAll();
    codigos[email] = {
      codigo,
      timestamp: Date.now(),
      usado: false,
    };
    localStorage.setItem(STORAGE_KEYS.CODIGOS, JSON.stringify(codigos));
    return codigo;
  },

  getAll: (): Record<string, { codigo: string; timestamp: number; usado: boolean }> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.CODIGOS);
    return data ? JSON.parse(data) : {};
  },

  validate: (email: string, codigo: string): boolean => {
    const codigos = codigosStorage.getAll();
    const codigoData = codigos[email];

    if (!codigoData || codigoData.usado) return false;

    // Código expira em 10 minutos
    const expirado = Date.now() - codigoData.timestamp > 10 * 60 * 1000;
    if (expirado) return false;

    if (codigoData.codigo === codigo) {
      codigoData.usado = true;
      localStorage.setItem(STORAGE_KEYS.CODIGOS, JSON.stringify(codigos));
      return true;
    }

    return false;
  },
};

// Gerenciamento de códigos de verificação via WhatsApp
export const codigosWhatsAppStorage = {
  generate: (whatsapp: string, participanteId: string): string => {
    // Gera código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    if (typeof window === 'undefined') return codigo;

    const codigos = codigosWhatsAppStorage.getAll();
    codigos[whatsapp] = {
      codigo,
      timestamp: Date.now(),
      usado: false,
      participanteId,
    };
    localStorage.setItem(STORAGE_KEYS.CODIGOS_WHATSAPP, JSON.stringify(codigos));
    return codigo;
  },

  getAll: (): Record<string, { codigo: string; timestamp: number; usado: boolean; participanteId: string }> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.CODIGOS_WHATSAPP);
    return data ? JSON.parse(data) : {};
  },

  validate: (whatsapp: string, codigo: string): { success: boolean; participanteId?: string } => {
    const codigos = codigosWhatsAppStorage.getAll();
    const codigoData = codigos[whatsapp];

    if (!codigoData || codigoData.usado) return { success: false };

    // Código expira em 10 minutos
    const expirado = Date.now() - codigoData.timestamp > 10 * 60 * 1000;
    if (expirado) return { success: false };

    if (codigoData.codigo === codigo) {
      codigoData.usado = true;
      localStorage.setItem(STORAGE_KEYS.CODIGOS_WHATSAPP, JSON.stringify(codigos));
      return { success: true, participanteId: codigoData.participanteId };
    }

    return { success: false };
  },
};
