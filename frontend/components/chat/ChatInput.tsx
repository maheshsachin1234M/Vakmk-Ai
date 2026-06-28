"use client";

import { Send } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { cn } from "../../lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !disabled) onSubmit();
      }}
      className="glass-strong rounded-2xl p-2 flex items-end gap-2"
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ask anything about your documents…"
        disabled={disabled}
        className={cn(
          "flex-1 bg-transparent resize-none outline-none px-3 py-2.5 text-sm",
          "placeholder:text-muted-foreground/70 max-h-44",
        )}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || disabled}
        className="h-10 w-10 flex-shrink-0"
      >
        {disabled ? <Spinner size={16} className="text-white" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}
