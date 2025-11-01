import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, ChatSession, ConversationContext, ConversationState } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { v4 as uuidv4 } from '../utils/uuid';

const getWelcomeMessage = (): Message => ({
  id: uuidv4(),
  role: 'assistant',
  text: "Hi! I'm your support assistant. What product can I help you with today?",
  timestamp: Date.now(),
});

const INITIAL_CONTEXT: ConversationContext = {
  product: null,
  issue: null,
  urgency: null,
  ticketId: null,
  state: 'greeting',
};

export const useChat = () => {
  const [session, setSession] = useState<ChatSession>({
    sessionId: '',
    messages: [getWelcomeMessage()],
    context: INITIAL_CONTEXT,
    pending: false,
    lastLatencyMs: 0,
    errors: [],
  });

  const [hasError, setHasError] = useState(false);
  const initializationRef = useRef(false);

  // Initialize session on mount
  useEffect(() => {
    const initializeChat = async () => {
      if (initializationRef.current) return;
      initializationRef.current = true;

      // Try to load existing session
      const savedSession = await storageService.loadSession();
      if (savedSession && savedSession.sessionId) {
        setSession(savedSession);
        return;
      }

      // Create new session
      try {
        const { sessionId } = await apiService.createSession();
        const newSession: ChatSession = {
          sessionId,
          messages: [getWelcomeMessage()],
          context: INITIAL_CONTEXT,
          pending: false,
          lastLatencyMs: 0,
          errors: [],
        };
        setSession(newSession);
        await storageService.saveSession(newSession);
      } catch (error) {
        console.error('Failed to create session:', error);
        setHasError(true);
      }
    };

    initializeChat();
  }, []);

  // Save session whenever it changes
  useEffect(() => {
    if (session.sessionId) {
      storageService.saveSession(session);
    }
  }, [session]);

  const sendMessage = useCallback(async (text: string) => {
    if (!session.sessionId || session.pending) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    // Optimistically add user message
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      pending: true,
    }));
    setHasError(false);

    const startTime = Date.now();

    try {
      const response = await apiService.sendMessage(
        session.sessionId,
        text,
        session.context
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        text: response.reply,
        timestamp: Date.now(),
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        context: response.context,
        pending: false,
        lastLatencyMs: response.latencyMs || Date.now() - startTime,
        errors: [],
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark user message with error
      const failedMessage: Message = {
        ...userMessage,
        error: true,
      };

      setSession((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === userMessage.id ? failedMessage : msg
        ),
        pending: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error'],
      }));
      setHasError(true);
    }
  }, [session.sessionId, session.context, session.pending]);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...session.messages]
      .reverse()
      .find((msg) => msg.role === 'user' && msg.error);
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.text);
    }
  }, [session.messages, sendMessage]);

  return {
    session,
    sendMessage,
    retryLastMessage,
    hasError,
    isLoading: !session.sessionId,
  };
};

