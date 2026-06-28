"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Logo } from "../shared/Logo";

const examples = [
  "Summarize the architecture decisions in this RFC.",
  "What does the spec say about thermal limits?",
  "List all the API endpoints mentioned across these docs.",
  "Compare the two proposals — what are the trade-offs?",
];

interface Props {
  onPick: (text: string) => void;
  hasDocuments: boolean;
}

export function EmptyState({ onPick, hasDocuments }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mb-6 animate-float">
        <Logo size={72} />
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold">
        Ask your <span className="text-gradient">knowledge</span>.
      </h2>
      <p className="mt-3 text-muted-foreground max-w-md">
        VAKMK AI retrieves the most relevant passages from your documents and
        composes a grounded, cited answer.
      </p>

      {!hasDocuments && (
        <div className="mt-6 glass rounded-xl px-4 py-3 text-sm text-amber-300 inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Upload a document first — head to the Documents tab.
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => onPick(ex)}
            className="glass rounded-xl p-4 text-left text-sm hover:bg-white/[0.06] transition-all hover:-translate-y-0.5"
          >
            {ex}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
