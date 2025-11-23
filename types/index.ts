export interface Event {
  uuid: string;
  title: string;
  date: string;
  min_value: number;
  max_value: number;
  description: string;
  email: string;
  drawPerformed: boolean;
  drawDate?: string;
  pairs?: SecretFriendPair[];
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  whatsapp?: string; // Optional - will be filled by the participant
  confirmed: boolean;
  secretFriendId?: string; // ID of the participant who got this one
}

export interface SecretFriendPair {
  participantId: string;
  participantName: string;
  secretFriendId: string;
  secretFriendName: string;
}

export interface User {
  email: string;
  events: Event[];
}
