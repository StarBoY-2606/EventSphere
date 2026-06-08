import React, { useState, useRef } from "react";
import { Upload, ImagePlus, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../../utils/api";
import { Event, Album } from "../types";

interface UploadPageProps {
  events: Event[];
  onUploaded?: () => void;
}

export default function UploadPage({ events, onUploaded }: UploadPageProps) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEventChange = async (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedAlbumId("");
    if (!eventId) { setAlbums([]); return; }
    try {
      const list = await api.get<Album[]>(`/events/${eventId}/albums`);
      setAlbums(list);
    } catch { setAlbums([]); }
  };

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!selectedEventId || !selectedAlbumId || !file) return;
    setStatus("uploading");
    try {
      const reader = new FileReader();
      reader.onload = async e => {
        const fileBase64 = e.target?.result as string;
        await api.post("/media", { eventId: selectedEventId, albumId: selectedAlbumId, title, fileBase64 });
        setStatus("success");
        setFile(null); setPreview(null); setTitle("");
        onUploaded?.();
        setTimeout(() => setStatus("idle"), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 24 }}>Upload photo</h2>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{ border: "2px dashed var(--color-border-secondary)", borderRadius: 12, padding: 40, textAlign: "center", cursor: "pointer", marginBottom: 20, background: preview ? "transparent" : "var(--color-background-secondary)", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight: 220, borderRadius: 8, objectFit: "contain" }} />
        ) : (
          <>
            <ImagePlus size={32} style={{ color: "var(--color-text-secondary)" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, margin: 0 }}>Drag & drop or click to select</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <select value={selectedEventId} onChange={e => handleEventChange(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13 }}>
          <option value="">Select event...</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>

        <select value={selectedAlbumId} onChange={e => setSelectedAlbumId(e.target.value)} disabled={!albums.length} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13, opacity: albums.length ? 1 : 0.5 }}>
          <option value="">Select album...</option>
          {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Photo title (optional)" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13 }} />

        <button
          onClick={handleSubmit}
          disabled={!selectedEventId || !selectedAlbumId || !file || status === "uploading"}
          style={{ padding: "10px 0", borderRadius: 8, border: "none", background: "var(--color-text-primary)", color: "var(--color-background-primary)", fontWeight: 500, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (!selectedEventId || !selectedAlbumId || !file) ? 0.5 : 1 }}
        >
          {status === "uploading" ? "Uploading..." : <><Upload size={16} /> Upload photo</>}
        </button>

        {status === "success" && <p style={{ color: "var(--color-text-success)", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}><CheckCircle size={14} /> Uploaded successfully!</p>}
        {status === "error" && <p style={{ color: "var(--color-text-danger)", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}><AlertCircle size={14} /> {errorMsg}</p>}
      </div>
    </div>
  );
}
