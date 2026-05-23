"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
  streaming?: boolean;
}

export function MessageBubble({ message, streaming }: Props) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <Logo size={28} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed text-sm",
          isUser
            ? "bg-brand-gradient text-white rounded-tr-md shadow-lg shadow-brand-violet/30"
            : "glass rounded-tl-md",
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <>
            <div className={cn("prose-vakmk", streaming && "stream-cursor")}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {message.content || ""}
              </ReactMarkdown>
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/[0.08]">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Sources
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((s, idx) => (
                    <SourceChip key={idx} index={idx + 1} source={s} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function SourceChip({
  index,
  source,
}: {
  index: number;
  source: NonNullable<ChatMessage["sources"]>[number];
}) {
  return (
    <div
      title={source.snippet}
      className="group inline-flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 text-[11px] hover:bg-white/[0.08] cursor-default max-w-full"
    >
      <span className="font-mono text-brand-fuchsia">[{index}]</span>
      <FileText className="h-3 w-3 text-brand-cyan flex-shrink-0" />
      <span className="truncate max-w-[160px]">{source.document_name}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">#{source.chunk_index}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-brand-cyan font-mono">{(source.score * 100).toFixed(0)}%</span>
    </div>
  );
}
