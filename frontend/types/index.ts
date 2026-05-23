/** Shared TypeScript types mirroring backend schemas. */

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  chunk_count: number;
  status: "processing" | "ready" | "failed";
  error_message?: string | null;
  created_at: string;
}

export interface SourceCitation {
  document_id: string;
  document_name: string;
  chunk_index: number;
  snippet: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: SourceCitation[] | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  session_id: string;
  message: ChatMessage;
}
