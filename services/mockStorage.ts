// Serviço de armazenamento local para uso em ambientes sem backend.
// Mantido para retrocompatibilidade com o fluxo de mocks legado.

import type { Event, Participant, User } from "@/types";

type Evento = Event & {
  id: string;
  emailOrganizador?: string;
  sorteioRealizado?: boolean;
};

type Participante = Participant & {
  id: string;
  eventoId: string;
  confirmado?: boolean;
  whatsapp?: string;
};

type Usuario = User & {
  senha?: string;
};

const STORAGE_KEYS = {
  EVENTOS: "amigo_secreto_eventos",
  PARTICIPANTES: "amigo_secreto_participantes",
  USUARIOS: "amigo_secreto_usuarios",
  CODIGOS: "amigo_secreto_codigos",
  CODIGOS_WHATSAPP: "amigo_secreto_codigos_whatsapp",
};

const isBrowser = typeof window !== "undefined";

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const eventosStorage = {
  getAll(): Evento[] {
    return readStorage<Evento[]>(STORAGE_KEYS.EVENTOS, []);
  },

  getByEmail(email: string): Evento[] {
    return this.getAll().filter((evento) => evento.email === email);
  },

  getById(id: string): Evento | null {
    return this.getAll().find((evento) => evento.id === id) ?? null;
  },

  create(evento: Omit<Evento, "id" | "sorteioRealizado">): Evento {
    const eventos = this.getAll();
    const novoEvento: Evento = {
      ...evento,
      id: crypto.randomUUID(),
      sorteioRealizado: false,
    };
    eventos.push(novoEvento);
    writeStorage(STORAGE_KEYS.EVENTOS, eventos);
    return novoEvento;
  },

  update(id: string, updates: Partial<Evento>): Evento | null {
    const eventos = this.getAll();
    const index = eventos.findIndex((evento) => evento.id === id);
    if (index === -1) return null;
    eventos[index] = { ...eventos[index], ...updates };
    writeStorage(STORAGE_KEYS.EVENTOS, eventos);
    return eventos[index];
  },
};

export const participantesStorage = {
  getAll(): Participante[] {
    return readStorage<Participante[]>(STORAGE_KEYS.PARTICIPANTES, []);
  },

  getByEventoId(eventoId: string): Participante[] {
    return this.getAll().filter(
      (participante) => participante.eventoId === eventoId
    );
  },

  getById(id: string): Participante | null {
    return this.getAll().find((participante) => participante.id === id) ?? null;
  },

  create(participante: Omit<Participante, "id" | "confirmado">): Participante {
    const participantes = this.getAll();
    const novoParticipante: Participante = {
      ...participante,
      id: crypto.randomUUID(),
      confirmado: false,
    };
    participantes.push(novoParticipante);
    writeStorage(STORAGE_KEYS.PARTICIPANTES, participantes);
    return novoParticipante;
  },

  update(id: string, updates: Partial<Participante>): Participante | null {
    const participantes = this.getAll();
    const index = participantes.findIndex(
      (participante) => participante.id === id
    );
    if (index === -1) return null;
    participantes[index] = { ...participantes[index], ...updates };
    writeStorage(STORAGE_KEYS.PARTICIPANTES, participantes);
    return participantes[index];
  },

  delete(id: string): boolean {
    const participantes = this.getAll();
    const filtrados = participantes.filter(
      (participante) => participante.id !== id
    );
    writeStorage(STORAGE_KEYS.PARTICIPANTES, filtrados);
    return filtrados.length !== participantes.length;
  },
};

type CodigoEmail = {
  codigo: string;
  timestamp: number;
  usado: boolean;
};

type CodigoWhatsapp = CodigoEmail & {
  participanteId: string;
};

export const codigosStorage = {
  generate(email: string): string {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    if (!isBrowser) return codigo;
    const codigos = readStorage<Record<string, CodigoEmail>>(
      STORAGE_KEYS.CODIGOS,
      {}
    );
    codigos[email] = { codigo, timestamp: Date.now(), usado: false };
    writeStorage(STORAGE_KEYS.CODIGOS, codigos);
    return codigo;
  },

  validate(email: string, codigo: string): boolean {
    const codigos = readStorage<Record<string, CodigoEmail>>(
      STORAGE_KEYS.CODIGOS,
      {}
    );
    const registro = codigos[email];
    if (!registro || registro.usado) return false;
    const expirado = Date.now() - registro.timestamp > 10 * 60 * 1000;
    if (expirado) return false;
    const valido = registro.codigo === codigo;
    if (valido) {
      registro.usado = true;
      writeStorage(STORAGE_KEYS.CODIGOS, codigos);
    }
    return valido;
  },
};

export const codigosWhatsAppStorage = {
  generate(whatsapp: string, participanteId: string): string {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    if (!isBrowser) return codigo;
    const codigos = readStorage<Record<string, CodigoWhatsapp>>(
      STORAGE_KEYS.CODIGOS_WHATSAPP,
      {}
    );
    codigos[whatsapp] = {
      codigo,
      timestamp: Date.now(),
      usado: false,
      participanteId,
    };
    writeStorage(STORAGE_KEYS.CODIGOS_WHATSAPP, codigos);
    return codigo;
  },

  validate(
    whatsapp: string,
    codigo: string
  ): { success: boolean; participanteId?: string } {
    const codigos = readStorage<Record<string, CodigoWhatsapp>>(
      STORAGE_KEYS.CODIGOS_WHATSAPP,
      {}
    );
    const registro = codigos[whatsapp];
    if (!registro || registro.usado) return { success: false };
    const expirado = Date.now() - registro.timestamp > 10 * 60 * 1000;
    if (expirado) return { success: false };
    const valido = registro.codigo === codigo;
    if (valido) {
      registro.usado = true;
      writeStorage(STORAGE_KEYS.CODIGOS_WHATSAPP, codigos);
      return { success: true, participanteId: registro.participanteId };
    }
    return { success: false };
  },
};
