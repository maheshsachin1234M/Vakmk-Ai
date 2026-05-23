"use client";

import { MessageSquarePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/api";
import { cn, timeAgo } from "@/lib/utils";
import { chatService } from "@/services/chat.service";
import type { ChatSession } from "@/types";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function SessionList({ sessions, activeId, onSelect, onDelete, loading }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    setDeletingId(id);
    try {
      await chatService.deleteSession(id);
      onDelete(id);
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/[0.06]">
        <Button onClick={() => onSelect(null)} className="w-full" variant="default" size="sm">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 px-2">
            No conversations yet. Ask something to start.
          </p>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "group w-full flex items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                activeId === s.id
                  ? "bg-white/[0.06] border border-white/[0.08]"
                  : "hover:bg-white/[0.04]",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{s.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {timeAgo(s.updated_at)}
                </div>
              </div>
              <span
                role="button"
                onClick={(e) => handleDelete(s.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
              >
                {deletingId === s.id ? (
                  <Spinner size={14} />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
