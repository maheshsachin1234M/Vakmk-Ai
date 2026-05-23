"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SessionList } from "@/components/chat/SessionList";
import { Logo } from "@/components/shared/Logo";
import { getErrorMessage } from "@/lib/api";
import { chatService } from "@/services/chat.service";
import { documentService } from "@/services/document.service";
import type { ChatMessage, ChatSession, DocumentItem } from "@/types";

function ChatWorkspaceInner() {
  const searchParams = useSearchParams();
  const initialSession = searchParams.get("session");

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  const [activeId, setActiveId] = useState<string | null>(initialSession);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions + docs once
  useEffect(() => {
    chatService
      .listSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
    documentService.list().then(setDocs).catch(() => {});
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    chatService
      .getMessages(activeId)
      .then(setMessages)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setMessagesLoading(false));
  }, [activeId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    // Optimistic user message
    const tempUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, tempUser]);
    setSending(true);

    try {
      const res = await chatService.ask({
        message: text,
        session_id: activeId,
      });
      // Sync state with server (server returns canonical assistant msg)
      setActiveId(res.session_id);
      // Refresh full message list (cheap, ensures correctness)
      const fresh = await chatService.getMessages(res.session_id);
      setMessages(fresh);
      // Refresh session list (title may have been auto-set)
      chatService.listSessions().then(setSessions).catch(() => {});
    } catch (err) {
      toast.error(getErrorMessage(err));
      // Roll back optimistic message
      setMessages((m) => m.filter((mm) => mm.id !== tempUser.id));
    } finally {
      setSending(false);
    }
  }

  const readyDocs = docs.filter((d) => d.status === "ready");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Session sidebar */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 border-r border-white/[0.06] bg-black/20">
        <SessionList
          sessions={sessions}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={(id) => {
            setSessions((s) => s.filter((x) => x.id !== id));
            if (id === activeId) setActiveId(null);
          }}
          loading={sessionsLoading}
        />
      </aside>

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-5 md:px-8 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size={28} />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {activeId
                  ? sessions.find((s) => s.id === activeId)?.title ?? "Conversation"
                  : "New conversation"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {readyDocs.length} document{readyDocs.length === 1 ? "" : "s"} indexed
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground glass rounded-full px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            RAG online
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messagesLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-brand-fuchsia" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState onPick={setInput} hasDocuments={readyDocs.length > 0} />
          ) : (
            <div className="px-4 md:px-8 py-6 space-y-5 max-w-4xl mx-auto">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {sending && (
                <MessageBubble
                  message={{
                    id: "pending",
                    role: "assistant",
                    content: "_Thinking through your documents…_",
                    created_at: new Date().toISOString(),
                  }}
                  streaming
                />
              )}
            </div>
          )}
        </div>

        <div className="px-4 md:px-8 py-4 border-t border-white/[0.06] bg-black/20">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              disabled={sending}
            />
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Answers are grounded in your documents and include citations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatWorkspace() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-brand-fuchsia" />
        </div>
      }
    >
      <ChatWorkspaceInner />
    </Suspense>
  );
}
