export type MessageRole = 'user' | 'assistant';

export type ConversationState = 
  | 'greeting' 
  | 'collecting_product' 
  | 'collecting_issue' 
  | 'collecting_urgency' 
  | 'confirming' 
  | 'complete';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  error?: boolean;
}

export interface ConversationContext {
  product: string | null;
  issue: string | null;
  urgency: 'low' | 'medium' | 'high' | null;
  ticketId: string | null;
  state: ConversationState;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  context: ConversationContext;
  pending: boolean;
  lastLatencyMs: number;
  errors: string[];
}

export interface ChatApiResponse {
  reply: string;
  context: ConversationContext;
  latencyMs: number;
}

export interface ChatApiError {
  error: string;
  retryAfterMs?: number;
}

