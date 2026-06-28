"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  FileText,
  Github,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Button } from "../components/ui/Button";
import { Logo } from "../components/shared/Logo";

const features = [
  {
    icon: FileText,
    title: "Upload anything",
    desc: "PDF, DOCX, TXT — we chunk, embed and index every page into a semantic vector store.",
  },
  {
    icon: Search,
    title: "Semantic retrieval",
    desc: "Cosine-similarity search over OpenAI embeddings with metadata filtering and chunk ranking.",
  },
  {
    icon: Brain,
    title: "RAG-grounded answers",
    desc: "Every answer is rooted in your documents and shipped with citation cards you can click.",
  },
  {
    icon: Network,
    title: "Multi-doc reasoning",
    desc: "Ask cross-document questions. The retriever pulls the best chunks from your whole corpus.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, your tenant",
    desc: "JWT auth, per-user document isolation, owner-scoped vector queries. No leaks.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    desc: "FastAPI + ChromaDB persistent index + streaming-ready answer generation.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 },
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-40 px-6 lg:px-10 py-4 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Logo size={36} withWordmark />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#stack" className="hover:text-foreground transition-colors">
              Stack
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative px-6 lg:px-10 pt-24 pb-32">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-fuchsia" />
            <span>Engineering Intelligence Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
          >
            Chat with your{" "}
            <span className="text-gradient">technical knowledge.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            VAKMK AI is an enterprise-grade RAG platform. Upload PDFs, DOCX, and TXT —
            then ask anything. Every answer is grounded in your documents with
            inline citations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <Button size="lg" className="min-w-[200px] h-14 text-base">
                Start building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px] h-14 text-base"
              >
                <Github className="mr-2 h-4 w-4" />
                View source
              </Button>
            </a>
          </motion.div>

          {/* Floating product preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-24 relative"
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute -inset-1 bg-brand-gradient rounded-3xl opacity-30 blur-2xl animate-glow-pulse" />
              <div className="relative glass-strong rounded-3xl p-8 md:p-12 text-left">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  <div className="ml-3 text-xs text-muted-foreground font-mono">
                    vakmk.ai/chat
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-end">
                    <div className="glass rounded-2xl rounded-tr-md px-4 py-2.5 text-sm max-w-[80%]">
                      How does the cooling system handle thermal runaway in the
                      battery pack spec?
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Logo size={28} />
                    <div className="flex-1">
                      <div className="glass rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed">
                        The pack uses a two-stage liquid-cooling loop with phase
                        change buffer. If a cell exceeds <strong>60°C</strong>,
                        the BMS isolates that module and routes coolant flow
                        <strong> [1][2]</strong>.
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] px-2 py-1 text-[11px] text-muted-foreground">
                          <FileText className="h-3 w-3 text-brand-cyan" />
                          BatterySpec-v3.pdf · chunk 14
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] px-2 py-1 text-[11px] text-muted-foreground">
                          <FileText className="h-3 w-3 text-brand-fuchsia" />
                          ThermalRunaway-Memo.docx · chunk 4
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="px-6 lg:px-10 py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Built like a <span className="text-gradient">real product.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Not a toy. Production-grade RAG pipeline, vector indexing,
              authentication and a premium UI shell.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all hover:-translate-y-1"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient mb-4 shadow-lg shadow-brand-violet/30">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="px-6 lg:px-10 py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              How <span className="text-gradient">VAKMK AI</span> thinks.
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Ingest",
                desc: "Upload PDF / DOCX / TXT. We extract text, chunk it with intelligent overlap, and embed every chunk with OpenAI.",
              },
              {
                step: "02",
                title: "Index",
                desc: "Embeddings land in ChromaDB with full metadata (doc id, owner id, chunk index) for fast filtered retrieval.",
              },
              {
                step: "03",
                title: "Retrieve",
                desc: "Your query is embedded. Top-k cosine-similar chunks are selected, owner-scoped, optionally filtered to a doc set.",
              },
              {
                step: "04",
                title: "Generate",
                desc: "GPT-4 class model reasons over the retrieved context. Answers cite sources inline; UI renders clickable chunk cards.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="font-display text-5xl font-bold text-gradient w-24 flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Stack ---------- */}
      <section id="stack" className="px-6 lg:px-10 py-32">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="text-gradient">Engineered</span> with care.
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Next.js 15 · TypeScript · Tailwind · Framer Motion · FastAPI ·
            LangChain · ChromaDB · OpenAI · PostgreSQL · JWT · Docker
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js 15",
              "TypeScript",
              "Tailwind CSS",
              "Framer Motion",
              "FastAPI",
              "LangChain",
              "ChromaDB",
              "OpenAI",
              "PostgreSQL",
              "JWT",
              "Docker",
            ].map((t) => (
              <span
                key={t}
                className="glass rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="px-6 lg:px-10 py-32">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-4xl relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-gradient opacity-90" />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative p-12 md:p-16 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to talk to your docs?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Create a free account. Upload your first document. Get grounded
              answers in seconds.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-brand-violet hover:bg-white/90 h-14 px-8 text-base font-semibold"
              >
                Get started — it&apos;s free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="px-6 lg:px-10 py-12 border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo size={28} withWordmark />
          <p className="text-sm text-muted-foreground">
            © 2026 VAKMK AI. Engineering Intelligence Platform.
          </p>
        </div>
      </footer>
    </main>
  );
}
