import { api, API_PREFIX } from "../lib/api";
import type { DocumentItem } from "../types";

export const documentService = {
  async list(): Promise<DocumentItem[]> {
    const { data } = await api.get<DocumentItem[]>(`${API_PREFIX}/documents`);
    return data;
  },

  async get(id: string): Promise<DocumentItem> {
    const { data } = await api.get<DocumentItem>(
      `${API_PREFIX}/documents/${id}`,
    );
    return data;
  },

  async upload(file: File, onProgress?: (pct: number) => void): Promise<DocumentItem> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<DocumentItem>(
      `${API_PREFIX}/documents/upload`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      },
    );
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_PREFIX}/documents/${id}`);
  },
};
