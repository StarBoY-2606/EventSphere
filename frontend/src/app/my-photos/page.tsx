import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, UploadCloud, Camera, AlertCircle, 
  CheckCircle, RefreshCw, Eye, Download, Heart, MessageSquare, Trash2, ScanEye
} from "lucide-react";
import { User, Media } from "../types";

interface AIPhotosViewProps {
  currentUser: User;
  token: string;
  onUpdateUser: (updatedUser: User) => void;
}

export function AIPhotosView({ currentUser, token, onUpdateUser }: AIPhotosViewProps) {
  const [selfie, setSelfie] = useState<string | null>(currentUser.referenceSelfieUrl || null);
  const [isScanning, setIsScanning] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState<Media[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSelfie(base64);
        
        // Save to user profile
        setIsUploading(true);
        try {
          const res = await fetch("/api/auth/selfie", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ referenceSelfieUrl: base64 })
          });
          if (res.ok) {
            onUpdateUser({ ...currentUser, referenceSelfieUrl: base64 });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSelfie = async () => {
    setIsUploading(true);
    try {
      const res = await fetch("/api/auth/selfie", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSelfie(null);
        onUpdateUser({ ...currentUser, referenceSelfieUrl: "" });
        setMatchedPhotos([]);
        setHasScanned(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunFaceScan = async () => {
    if (!selfie) return;
    setIsScanning(true);
    setHasScanned(false);
    setScanMessage("Extracting spatial geometry markers...");

    setTimeout(() => setScanMessage("Interfacing with Gemini Multi-Modal Model..."), 1500);
    setTimeout(() => setScanMessage("Scanning global AWS S3 archives..."), 3000);

    try {
      const res = await fetch("/api/face-recognition/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMatchedPhotos(data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
      setHasScanned(true);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Facial Locator Console</h1>
        <p className="text-xs text-on-surface-variant">Synchronize profile descriptors to index matching image files across all events instantly.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Selfie Reference Upload side */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-outline flex items-center gap-1.5">
              <ScanEye className="w-5 h-5 text-primary" /> Reference Descriptor Base
            </h3>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Upload a clear frontal high-fidelity selfie. The Gemini visual core will isolate architectural face contours and lookups to identify your matches in global directories.
            </p>

            {/* Selfie Preview */}
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-white/5 relative flex items-center justify-center group">
              {selfie ? (
                <>
                  <img className="w-full h-full object-cover" alt="Profile selfie reference" src={selfie} />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-sm p-3 text-center border-t border-white/5">
                    <span className="text-[10px] font-mono text-tertiary flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> SECURE MATCHING VECTOR OK
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <Camera className="w-8 h-8 text-outline mx-auto animate-pulse" />
                  <div className="text-xs text-zinc-300 font-bold">No Reference Photo Saved</div>
                  <div className="text-[9px] text-outline uppercase font-mono">1 Profile Image Slot Available</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <input id="selfieInput" type="file" className="hidden" accept="image/*" onChange={handleSelfieSelect} />
            <button
              onClick={() => document.getElementById("selfieInput")?.click()}
              disabled={isUploading || isScanning}
              className="w-full h-11 bg-white/5 border border-white/10 text-xs text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer font-bold leading-none shrink-0"
            >
              {isUploading ? "Verifying..." : selfie ? "Replace Selfie Reference" : "Upload Selfie Reference"}
            </button>

            {selfie && (
              <>
                <button
                  disabled={isScanning}
                  onClick={handleRunFaceScan}
                  className="w-full h-11 bg-primary text-on-primary font-extrabold text-xs rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 shrink-0"
                >
                  {isScanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                  <span>Scan Event Vaults</span>
                </button>

                <button
                  disabled={isUploading || isScanning}
                  onClick={handleDeleteSelfie}
                  className="w-full h-11 bg-error/10 border border-error/20 hover:bg-error/20 text-xs text-error rounded-xl transition-all cursor-pointer font-bold leading-none shrink-0"
                >
                  Delete Selfie Reference
                </button>
              </>
            )}
          </div>
        </div>

        {/* Multi-scan Results view */}
        <div className="col-span-2 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-outline">Scan Output Matches</h3>
            {hasScanned && (
              <span className="font-mono text-[10px] text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                {matchedPhotos.length} Matches Found
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 text-center space-y-4"
                key="scanning"
              >
                <div className="relative inline-block">
                  <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <ScanEye className="w-6 h-6 text-primary absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono animate-pulse">{scanMessage}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-1">Comparing face landmark profiles using multi-modal AI...</p>
                </div>
              </motion.div>
            ) : hasScanned ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
                key="results"
              >
                {matchedPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {matchedPhotos.map((media) => (
                      <div key={media.id} className="group rounded-xl overflow-hidden glass-panel relative aspect-square bg-slate-900 border border-white/5">
                        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={media.thumbnailUrl} alt="Matched face" />
                        
                        <div className="absolute top-3 left-3 bg-[#4edea3]/90 text-[#003824] font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> VERIFIED MATCH
                        </div>

                        {/* Hover Overlay summary details */}
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                          <div className="text-xs">
                            <div className="text-outline font-mono text-[9px]">Uploader:</div>
                            <div className="text-zinc-100 font-bold truncate">{media.uploaderName}</div>
                          </div>
                          
                          <button
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = media.url;
                              a.download = `Matched-${media.id}.png`;
                              a.click();
                            }}
                            className="bg-primary hover:bg-primary-container text-on-primary font-bold text-[11px] h-9 rounded-lg flex items-center justify-center gap-1 w-full"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Match
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-outline mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-white">No Matched Records Found</h4>
                      <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">We couldn't verify your facial reference features in any of the current events photo archives.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center space-y-4 text-on-surface-variant"
                key="idle"
              >
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Camera className="w-6 h-6 text-outline" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-300">Face Vector Indexing Core Standing By</h4>
                  <p className="text-xs text-outline max-w-xs mx-auto mt-1">Secure self-identification selfie to launch real-time scans on active photo streams.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
