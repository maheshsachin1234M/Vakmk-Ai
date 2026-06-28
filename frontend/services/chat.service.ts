import { api, API_PREFIX } from "../lib/api";
import type { ChatMessage, ChatResponse, ChatSession } from "../types";

export const chatService = {
  async ask(payload: {
    message: string;
    session_id?: string | null;
    document_ids?: string[];
  }): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>(
      `${API_PREFIX}/chat/ask`,
      payload,
    );
    return data;
  },

  async listSessions(): Promise<ChatSession[]> {
    const { data } = await api.get<ChatSession[]>(
      `${API_PREFIX}/chat/sessions`,
    );
    return data;
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(
      `${API_PREFIX}/chat/sessions/${sessionId}/messages`,
    );
    return data;
  },

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`${API_PREFIX}/chat/sessions/${sessionId}`);
  },
};
