"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FileText, MessageSquare, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "../../components/shared/Logo";
import { useAuth } from "../../hooks/useAuth";
import { documentService } from "../../services/document.service";
import { chatService } from "../../services/chat.service";
import type { ChatSession, DocumentItem } from "../../types";
import { timeAgo } from "../../lib/utils";

export default function DashboardHome() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      documentService.list().catch(() => []),
      chatService.listSessions().catch(() => []),
    ]).then(([d, s]) => {
      setDocs(d);
      setSessions(s);
      setLoading(false);
    });
  }, []);

  const readyDocs = docs.filter((d) => d.status === "ready").length;
  const totalChunks = docs.reduce((sum, d) => sum + d.chunk_count, 0);

  const quickActions = [
    {
      href: "/dashboard/chat",
      title: "Start a new conversation",
      desc: "Ask anything across your documents.",
      icon: MessageSquare,
      color: "from-brand-violet to-brand-fuchsia",
    },
    {
      href: "/dashboard/documents",
      title: "Upload a document",
      desc: "PDF, DOCX, TXT — indexed automatically.",
      icon: FileText,
      color: "from-brand-fuchsia to-brand-cyan",
    },
    {
      href: "/dashboard/search",
      title: "Semantic search",
      desc: "Find passages by meaning, not just words.",
      icon: Search,
      color: "from-brand-cyan to-brand-indigo",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl w-full mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
          Dashboard
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">
          Welcome back, <span className="text-gradient">{user?.full_name?.split(" ")[0] || "there"}</span>.
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Your engineering intelligence workspace is ready.
        </p>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Documents indexed", value: readyDocs, total: docs.length },
          { label: "Vector chunks", value: totalChunks },
          { label: "Conversations", value: sessions.length },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="glass rounded-2xl p-5"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {s.label}
            </div>
            <div className="font-display text-3xl font-semibold">
              {loading ? "—" : s.value.toLocaleString()}
              {s.total !== undefined && (
                <span className="text-sm text-muted-foreground ml-2 font-sans">
                  / {s.total}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-fuchsia" />
        Quick actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {quickActions.map((a, i) => (
          <motion.div
            key={a.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Link
              href={a.href}
              className="group block glass rounded-2xl p-5 hover:bg-white/[0.06] transition-all hover:-translate-y-1"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} mb-3 shadow-lg`}
              >
                <a.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold mb-1">{a.title}</div>
                  <div className="text-sm text-muted-foreground">{a.desc}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent documents</h2>
            <Link href="/dashboard/documents" className="text-xs text-brand-cyan hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg skeleton" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No documents yet. Upload one to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {docs.slice(0, 5).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-white/[0.04]"
                >
                  <FileText className="h-4 w-4 text-brand-cyan flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {d.original_filename}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {d.chunk_count} chunks · {timeAgo(d.created_at)}
                    </div>
                  </div>
                  <StatusPill status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent chats</h2>
            <Link href="/dashboard/chat" className="text-xs text-brand-cyan hover:underline">
              Open chat
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg skeleton" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {sessions.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/chat?session=${s.id}`}
                    className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-white/[0.04]"
                  >
                    <MessageSquare className="h-4 w-4 text-brand-fuchsia flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {timeAgo(s.updated_at)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="mt-16 flex items-center gap-3 text-xs text-muted-foreground justify-center">
        <Logo size={20} />
        <span>VAKMK AI — Engineering Intelligence Platform</span>
      </footer>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "ready"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : status === "processing"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20";
  return (
    <span className={`text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded ${styles}`}>
      {status}
    </span>
  );
}
