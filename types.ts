
export enum SenderType {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: number;
}
