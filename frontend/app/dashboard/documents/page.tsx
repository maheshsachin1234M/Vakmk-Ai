"use client";

import { motion } from "framer-motion";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/api";
import { formatBytes, timeAgo } from "@/lib/utils";
import { documentService } from "@/services/document.service";
import type { DocumentItem } from "@/types";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    try {
      setDocs(await documentService.list());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // Soft-poll for processing → ready transitions
    const id = setInterval(() => {
      documentService
        .list()
        .then(setDocs)
        .catch(() => {});
    }, 4000);
    return () => clearInterval(id);
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadPct(0);
    try {
      const doc = await documentService.upload(file, setUploadPct);
      setDocs((d) => [doc, ...d]);
      toast.success(`Uploaded "${file.name}" — indexing in progress.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      setUploadPct(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document and all its vectors?")) return;
    try {
      await documentService.remove(id);
      setDocs((d) => d.filter((x) => x.id !== id));
      toast.success("Document deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl w-full mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
            Library
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Your <span className="text-gradient">documents</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            PDF, DOCX, TXT. Up to 25 MB each. Indexed automatically.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Spinner size={16} className="text-white mr-2" />
              Uploading {uploadPct}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload document
            </>
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
      </header>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl skeleton" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-semibold text-lg mb-1">No documents yet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Upload your first PDF, DOCX, or TXT file to start chatting with it.
          </p>
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload your first document
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {docs.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-violet/30 to-brand-cyan/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-brand-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{d.original_filename}</div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  <span>{formatBytes(d.size_bytes)}</span>
                  <span>{d.chunk_count} chunks</span>
                  <span>{timeAgo(d.created_at)}</span>
                </div>
              </div>
              <StatusPill status={d.status} message={d.error_message ?? undefined} />
              <button
                onClick={() => handleDelete(d.id)}
                className="text-muted-foreground hover:text-red-400 transition-colors p-2"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status, message }: { status: string; message?: string }) {
  const styles =
    status === "ready"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : status === "processing"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20";
  return (
    <span
      title={message}
      className={`text-[10px] uppercase tracking-wider border px-2 py-1 rounded inline-flex items-center gap-1.5 ${styles}`}
    >
      {status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status}
    </span>
  );
}
