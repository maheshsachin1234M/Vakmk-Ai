"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Spinner } from "../../../components/ui/Spinner";
import { getErrorMessage } from "../../../lib/api";
import { chatService } from "../../../services/chat.service";
import type { SourceCitation } from "../../../types";

/**
 * Semantic search page — reuses the /chat/ask endpoint server-side to surface
 * retrieved chunks. We treat the user's query as a "show me passages" prompt.
 */
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SourceCitation[]>([]);
  const [answer, setAnswer] = useState<string>("");

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setAnswer("");
    try {
      const res = await chatService.ask({
        message: `Find the most relevant passages about: ${query}. Briefly summarize what they say.`,
      });
      setAnswer(res.message.content);
      setResults(res.message.sources ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl w-full mx-auto">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
          Semantic search
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Search by <span className="text-gradient">meaning</span>, not just words.
        </h1>
        <p className="text-muted-foreground mt-2">
          Vector retrieval over your indexed documents. Returns the top-K passages.
        </p>
      </header>

      <form onSubmit={runSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. battery thermal management strategy"
            className="pl-11 h-12"
          />
        </div>
        <Button type="submit" size="lg" disabled={loading || !query.trim()}>
          {loading ? <Spinner className="text-white" /> : <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      {answer && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Summary
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
        </motion.section>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl skeleton" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Top {results.length} passages
          </h2>
          <div className="space-y-3">
            {results.map((r, idx) => (
              <motion.div
                key={`${r.document_id}-${r.chunk_index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-brand-cyan" />
                    <span className="font-medium truncate">{r.document_name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">chunk #{r.chunk_index}</span>
                  </div>
                  <span className="text-[11px] font-mono text-brand-fuchsia">
                    {(r.score * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {r.snippet}…
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
