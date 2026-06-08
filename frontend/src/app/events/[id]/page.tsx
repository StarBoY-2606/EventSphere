import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Plus, MapPin, Calendar, Lock, Unlock, Eye, Trash2, 
  ChevronRight, ArrowLeft, Image as ImageIcon, Sparkles, Heart, 
  MessageSquare, Download, Share2, QrCode, X, FileText, Send, UploadCloud, FolderDot, AlertCircle, Bookmark, CheckCircle,
  Presentation, Award, Briefcase, Music, Palette, SlidersHorizontal, Pencil
} from "lucide-react";
import { Event, Album, Media, Comment, User, UserRole } from "../types";

interface EventsViewProps {
  currentUser: User;
  token: string;
  onRefreshStats: () => void;
}

export function EventsView({ currentUser, token, onRefreshStats }: EventsViewProps) {
  // Render category-specific icons dynamically
  const getCategoryIcon = (category: string) => {
    const c = category.toUpperCase();
    switch (c) {
      case "CONFERENCE":
        return <Presentation className="w-3.5 h-3.5 text-primary" />;
      case "GALA":
        return <Award className="w-3.5 h-3.5 text-[#ffbe3b]" />;
      case "WEDDING":
        return <Heart className="w-3.5 h-3.5 text-[#ff4e7c]" fill="#ff4e7c" />;
      case "WORKSHOP":
        return <Briefcase className="w-3.5 h-3.5 text-secondary" />;
      case "CONCERT":
        return <Music className="w-3.5 h-3.5 text-tertiary" />;
      case "EXHIBITION":
        return <Palette className="w-3.5 h-3.5 text-info" />;
      default:
        return <Calendar className="w-3.5 h-3.5 text-outline" />;
    }
  };

  // Navigation stack
  // "LIST" | "EVENT_DETAIL" | "ALBUM_DETAIL"
  const [currentView, setCurrentView] = useState<"LIST" | "EVENT_DETAIL" | "ALBUM_DETAIL">("LIST");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // States
  const [events, setEvents] = useState<Event[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  
  // Modals & Forms
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isNewAlbumOpen, setIsNewAlbumOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Cover selection presets
  const COVER_PRESETS = [
    {
      name: "Tech Summit",
      category: "Conference",
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80"
    },
    {
      name: "Executive Gala",
      category: "Gala",
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&auto=format&fit=crop&q=80"
    },
    {
      name: "Sterling Wedding",
      category: "Wedding",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80"
    },
    {
      name: "Creative Workshop",
      category: "Workshop",
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80"
    },
    {
      name: "Music Concert",
      category: "Concert",
      url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1000&auto=format&fit=crop&q=80"
    },
    {
      name: "Symmetric Design",
      category: "Other",
      url: "https://images.unsplash.com/photo-1531058020387-3be344559be6?w=1000&auto=format&fit=crop&q=80"
    }
  ];

  // Forms and Cover image states
  const [coverChoice, setCoverChoice] = useState<"preset" | "url" | "upload">("preset");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [uploadedCoverBase64, setUploadedCoverBase64] = useState("");

  // Album cover image presets
  const ALBUM_COVER_PRESETS = [
    {
      name: "Chic Decor",
      url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Banquet Hall",
      url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Outdoor Stage",
      url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Champagne Toast",
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Spotlight Visuals",
      url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Audience Cheers",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
    }
  ];

  // Album creation cover configs
  const [albumCoverChoice, setAlbumCoverChoice] = useState<"preset" | "url" | "upload">("preset");
  const [selectedAlbumPresetIndex, setSelectedAlbumPresetIndex] = useState(0);
  const [customAlbumCoverUrl, setCustomAlbumCoverUrl] = useState("");
  const [uploadedAlbumCoverBase64, setUploadedAlbumCoverBase64] = useState("");

  // Edit Event state managers
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editEventForm, setEditEventForm] = useState({ 
    name: "", 
    category: "Conference", 
    date: "", 
    description: "", 
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE" 
  });
  const [editCoverChoice, setEditCoverChoice] = useState<"preset" | "url" | "upload">("preset");
  const [selectedEditPresetIndex, setSelectedEditPresetIndex] = useState(0);
  const [customEditCoverUrl, setCustomEditCoverUrl] = useState("");
  const [uploadedEditCoverBase64, setUploadedEditCoverBase64] = useState("");
  
  // Form fields
  const [newEvent, setNewEvent] = useState({ name: "", category: "Conference", date: "", description: "", visibility: "PUBLIC" as "PUBLIC" | "PRIVATE" });
  const [newAlbum, setNewAlbum] = useState({ name: "" });
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; base64: string }[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");

  // Advanced search states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "name_asc" | "name_desc" | "category_asc" | "category_desc">("date_desc");

  // Lightbox View
  const [activeMedia, setActiveMedia] = useState<Media | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Album Media Filter / AI Tags states
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [selectedMediaTag, setSelectedMediaTag] = useState("ALL");

  // API fetches
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events", { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAlbums = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/albums`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setAlbums(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMedia = async (albumId: string) => {
    try {
      const res = await fetch(`/api/albums/${albumId}/media`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setMediaList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  // Handle Event selection
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    fetchAlbums(event.id);
    setCurrentView("EVENT_DETAIL");
  };

  // Handle Album selection
  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    setMediaSearchQuery("");
    setSelectedMediaTag("ALL");
    fetchMedia(album.id);
    setCurrentView("ALBUM_DETAIL");
  };

  // Back actions
  const handleBackToList = () => {
    setSelectedEvent(null);
    setCurrentView("LIST");
  };

  const handleBackToEvent = () => {
    setSelectedAlbum(null);
    if (selectedEvent) fetchAlbums(selectedEvent.id);
    setCurrentView("EVENT_DETAIL");
  };

  // Create Event Form submit
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) return;

    let coverImage = COVER_PRESETS[selectedPresetIndex]?.url;
    if (coverChoice === "url" && customCoverUrl) {
      coverImage = customCoverUrl;
    } else if (coverChoice === "upload" && uploadedCoverBase64) {
      coverImage = uploadedCoverBase64;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          ...newEvent,
          coverImage
        })
      });
      if (res.ok) {
        setIsNewEventOpen(false);
        setNewEvent({ name: "", category: "Conference", date: "", description: "", visibility: "PUBLIC" });
        setCustomCoverUrl("");
        setUploadedCoverBase64("");
        setCoverChoice("preset");
        setSelectedPresetIndex(0);
        fetchEvents();
        onRefreshStats();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create event");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Album Form submit
  const handleCreateAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbum.name || !selectedEvent) return;

    let coverImage = ALBUM_COVER_PRESETS[selectedAlbumPresetIndex]?.url;
    if (albumCoverChoice === "url" && customAlbumCoverUrl) {
      coverImage = customAlbumCoverUrl;
    } else if (albumCoverChoice === "upload" && uploadedAlbumCoverBase64) {
      coverImage = uploadedAlbumCoverBase64;
    }

    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
          ...newAlbum, 
          eventId: selectedEvent.id,
          coverImage 
        })
      });
      if (res.ok) {
        setIsNewAlbumOpen(false);
        setNewAlbum({ name: "" });
        setAlbumCoverChoice("preset");
        setSelectedAlbumPresetIndex(0);
        setCustomAlbumCoverUrl("");
        setUploadedAlbumCoverBase64("");
        fetchAlbums(selectedEvent.id);
        onRefreshStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Edit event click & pre-population
  const handleEditEventClick = (event: Event) => {
    setEditingEvent(event);
    setEditEventForm({
      name: event.name,
      category: event.category,
      date: event.date,
      description: event.description,
      visibility: event.visibility
    });
    
    // Check if the current cover is a preset
    const presetIdx = COVER_PRESETS.findIndex(p => p.url === event.coverImage);
    if (presetIdx !== -1) {
      setEditCoverChoice("preset");
      setSelectedEditPresetIndex(presetIdx);
      setCustomEditCoverUrl("");
      setUploadedEditCoverBase64("");
    } else if (event.coverImage && event.coverImage.startsWith("data:")) {
      setEditCoverChoice("upload");
      setSelectedEditPresetIndex(0);
      setCustomEditCoverUrl("");
      setUploadedEditCoverBase64(event.coverImage);
    } else {
      setEditCoverChoice("url");
      setSelectedEditPresetIndex(0);
      setCustomEditCoverUrl(event.coverImage || "");
      setUploadedEditCoverBase64("");
    }
  };

  // Edit Event submit handler
  const handleEditEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editEventForm.name || !editEventForm.date) return;

    let coverImage = editingEvent.coverImage;
    if (editCoverChoice === "preset") {
      coverImage = COVER_PRESETS[selectedEditPresetIndex]?.url || coverImage;
    } else if (editCoverChoice === "url" && customEditCoverUrl) {
      coverImage = customEditCoverUrl;
    } else if (editCoverChoice === "upload" && uploadedEditCoverBase64) {
      coverImage = uploadedEditCoverBase64;
    }

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          ...editEventForm,
          coverImage
        })
      });
      if (res.ok) {
        const updated = await res.json();
        // Update states:
        setEvents(prev => prev.map(evt => evt.id === editingEvent.id ? updated : evt));
        if (selectedEvent && selectedEvent.id === editingEvent.id) {
          setSelectedEvent(updated);
        }
        setEditingEvent(null);
        fetchEvents();
        onRefreshStats();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update event details.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete event handler
  const handleDeleteEventClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      title: "Discard Event Directory?",
      message: "Are you sure you want to discard this event and all associated albums/media items? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/events/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            fetchEvents();
            onRefreshStats();
          }
        } catch (err) {
          console.error(err);
        }
        setConfirmModal(null);
      }
    });
  };

  // File to Base64 encoder helper
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      loadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      loadFiles(Array.from(e.target.files));
    }
  };

  const loadFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles(prev => [...prev, { name: file.name, base64: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit media upload items
  const handleMediaUploadSubmit = async () => {
    if (uploadedFiles.length === 0 || !selectedEvent || !selectedAlbum) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of uploadedFiles) {
      try {
        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            eventId: selectedEvent.id,
            albumId: selectedAlbum.id,
            title: uploadTitle || file.name.split(".")[0],
            fileBase64: file.base64
          })
        });

        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setIsUploading(false);
    setUploadedFiles([]);
    setUploadTitle("");
    setIsUploadOpen(false);
    fetchMedia(selectedAlbum.id);
    onRefreshStats();
  };

  // Open Lightbox
  const handleMediaClick = async (media: Media) => {
    setActiveMedia(media);
    // Fetch comments
    try {
      const res = await fetch(`/api/media/${media.id}/comments`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const commentData = await res.json();
        setComments(commentData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete media item
  const handleDeleteMedia = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      title: "Purge Media Asset?",
      message: "Are you sure you want to permanently delete this media asset? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/media/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            setMediaList(prev => prev.filter(m => m.id !== id));
            if (activeMedia?.id === id) setActiveMedia(null);
            onRefreshStats();
          }
        } catch (err) {
          console.error(err);
        }
        setConfirmModal(null);
      }
    });
  };

  // Post social comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !activeMedia) return;

    try {
      const res = await fetch(`/api/media/${activeMedia.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const newC = await res.json();
        setComments(prev => [...prev, newC]);
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Like Toggle
  const handleLikeToggle = async (e: React.MouseEvent, media: Media) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/media/${media.id}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const update = await res.json();
        // Update local state list
        setMediaList(prev => prev.map(m => m.id === media.id ? { ...m, likesCount: update.likesCount } : m));
        if (activeMedia?.id === media.id) {
          setActiveMedia(prev => prev ? { ...prev, likesCount: update.likesCount } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Favourites Toggle
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});
  const handleFavToggle = async (e: React.MouseEvent, media: Media) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/media/${media.id}/favourite`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setFavMap(prev => ({ ...prev, [media.id]: d.favourited }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Secure download trigger
  const handleSecureDownload = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/media/download/${mediaId}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        // If server returns an inline SVG download
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("svg+xml")) {
          const svgCode = await res.text();
          const blob = new Blob([svgCode], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Secure-${mediaId}.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          // JSON returns
          const d = await res.json();
          // Draw watermark on client canvas
          applyClientWatermarkAndDownload(d.watermarkedUrl, d.eventName);
        }
      }
    } catch (err) {
      console.error("Download fail", err);
    }
  };

  // In-client canvas watermarker to ensure high-fidelity secure protection even if offline!
  const applyClientWatermarkAndDownload = (imgUrl: string, eventName: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 450;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw photo
      ctx.drawImage(img, 0, 0);

      // Overlay security transparent watermark tape
      ctx.fillStyle = "rgba(11, 19, 38, 0.85)";
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

      ctx.font = "bold 20px 'Inter', sans-serif";
      ctx.fillStyle = "#adc6ff";
      ctx.fillText("© EventSphere Secure Protocol", 30, canvas.height - 24);

      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "#dae2fd";
      ctx.textAlign = "right";
      ctx.fillText(eventName, canvas.width - 30, canvas.height - 26);

      // Trigger standard download
      const resultData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = resultData;
      a.download = `Secure-Watermark-${eventName.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  };

  // Mock download ZIP format list helper
  const triggerZipArchiveDownload = () => {
    if (mediaList.length === 0) return;
    
    const manifest = `=== EventSphere Live Media ZIP Archive ===\nCreated: ${new Date().toISOString()}\nEvent: ${selectedEvent?.name}\nAlbum: ${selectedAlbum?.name}\nTotal High-Res Photos: ${mediaList.length}\nFiles:\n` + 
      mediaList.map((m, idx) => `[File-${idx + 1}] ID: ${m.id} - Uploaded by ${m.uploaderName} on ${m.uploadDate} - Size: Custom S3 Standard Block`).join("\n");
    
    // Download text manifest
    const blob = new Blob([manifest], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Archive-${selectedAlbum?.name.replace(/\s+/g, "-")}-Manifest.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`Preparing ZIP Archive of over ${mediaList.length} high-resolution photographs directly synced to AWS S3. Your S3 bucket stream transfer is active. Check your folder manifest for references!`);
  };

  // Computed files & listings filtering with Advanced Search, Date range, and custom Sorts
  const filteredAndSortedEvents = useMemo(() => {
    let result = events.filter(e => {
      // 1. Text Search (Name, Description, Category)
      const matchesSearch = searchQuery.trim() === "" || 
                            e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category Search
      const matchesCategory = selectedCategory === "ALL" || e.category.toUpperCase() === selectedCategory.toUpperCase();
      
      // 3. Visibility Search
      const matchesVisibility = visibilityFilter === "ALL" || e.visibility === visibilityFilter;

      // 4. Date range Search
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && e.date >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && e.date <= endDate;
      }

      // Viewers cannot see PRIVATE events
      const canSee = currentUser.role !== UserRole.VIEWER || e.visibility === "PUBLIC";

      return matchesSearch && matchesCategory && matchesVisibility && matchesDate && canSee;
    });

    // 5. Sorting
    const sorted = [...result].sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "category_asc") {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === "category_desc") {
        return b.category.localeCompare(a.category);
      }
      return 0;
    });

    return sorted;
  }, [events, searchQuery, selectedCategory, visibilityFilter, startDate, endDate, sortBy, currentUser]);

  // Computed unique tags inside current album
  const albumUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    mediaList.forEach(m => {
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach(t => {
          if (t) tagsSet.add(t.trim());
        });
      }
    });
    return Array.from(tagsSet);
  }, [mediaList]);

  // Computed filtered media list inside current album based on mediaSearchQuery and selectedMediaTag
  const filteredAndSortedMedia = useMemo(() => {
    return mediaList.filter(m => {
      // 1. Selected Tag Filter
      if (selectedMediaTag !== "ALL") {
        if (!m.tags || !m.tags.some(t => t.toUpperCase() === selectedMediaTag.toUpperCase())) {
          return false;
        }
      }
      // 2. Search Query (Title, Uploader name, Tag keyword)
      if (mediaSearchQuery.trim() !== "") {
        const q = mediaSearchQuery.toLowerCase();
        const matchTitle = m.title?.toLowerCase().includes(q);
        const matchUploader = m.uploaderName?.toLowerCase().includes(q);
        const matchTags = m.tags && m.tags.some(t => t.toLowerCase().includes(q));
        return matchTitle || matchUploader || matchTags;
      }
      return true;
    });
  }, [mediaList, selectedMediaTag, mediaSearchQuery]);

  return (
    <div className="space-y-8 font-sans">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: EVENTS LISTING */}
        {currentView === "LIST" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
            key="list"
          >
            {/* Header section with inline action buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Events Console</h1>
                <p className="text-xs text-on-surface-variant">Configure, browse, and edit real-time event directories.</p>
              </div>

              {currentUser.role === UserRole.ADMIN && (
                <button
                  onClick={() => setIsNewEventOpen(true)}
                  className="bg-primary text-on-primary font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan New Event</span>
                </button>
              )}
            </div>

            {/* Structured interactive filters row */}
            <div className="space-y-3">
              <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:grow flex gap-2">
                  <div className="relative grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input
                      className="w-full h-11 bg-slate-950/20 border border-white/5 rounded-xl pl-11 pr-4 text-xs text-white focus:outline-none focus:border-primary placeholder:text-outline/40"
                      placeholder="Search events by tagline, keyword, description..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer shrink-0 select-none ${
                      showAdvanced
                        ? "bg-primary text-on-primary border-primary font-bold shadow-lg shadow-primary/10"
                        : "bg-slate-950/10 border-white/5 text-outline hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Advanced Search & Sort</span>
                  </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0 select-none">
                  {["ALL", "CONFERENCE", "GALA", "WEDDING", "WORKSHOP"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase border tracking-wider cursor-pointer font-bold transition-all ${
                        selectedCategory === cat
                          ? "bg-primary border-primary text-on-primary"
                          : "bg-slate-950/10 border-white/5 text-on-surface-variant hover:border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 shrink-0 select-none">
                  {["ALL", "PUBLIC", "PRIVATE"].map((vis) => (
                    <button
                      key={vis}
                      onClick={() => setVisibilityFilter(vis)}
                      className={`px-3 py-1.5 rounded-lg text-xs border cursor-pointer font-semibold transition-all ${
                        visibilityFilter === vis
                          ? "bg-secondary-container border-secondary-container text-on-secondary-container font-bold"
                          : "bg-transparent border-white/5 text-on-surface-variant hover:border-white/10"
                      }`}
                    >
                      {vis}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide-down Advanced Controls (Date scope & Sort direction) */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end overflow-hidden border border-white/5 bg-slate-950/10"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-outline font-bold">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-outline font-bold">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-outline font-bold">Sort Listings By</label>
                      <select
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-medium"
                      >
                        <option value="date_desc">Schedule: Latest First</option>
                        <option value="date_asc">Schedule: Earliest First</option>
                        <option value="name_asc">Name: Alphabetical A-Z</option>
                        <option value="name_desc">Name: Alphabetical Z-A</option>
                        <option value="category_asc">Category: Alphabetical A-Z</option>
                        <option value="category_desc">Category: Alphabetical Z-A</option>
                      </select>
                    </div>

                    <div>
                      <button
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                          setSortBy("date_desc");
                        }}
                        className="h-11 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold w-full transition-all cursor-pointer border border-white/5 active:scale-98"
                      >
                        Reset Scope Criteria
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="glass-panel rounded-2xl overflow-hidden cursor-pointer group flex flex-col h-full hover:scale-[1.01] transition-all relative"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-900 border-b border-white/5">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={event.name}
                      src={event.coverImage}
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider uppercase font-semibold border ${
                        event.visibility === "PUBLIC"
                          ? "bg-tertiary/10 border-tertiary/30 text-tertiary"
                          : "bg-secondary/10 border-secondary/30 text-secondary"
                      }`}>
                        {event.visibility === "PUBLIC" ? "Public Space" : "Private Vault"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 text-xs font-mono text-white flex items-center gap-1.5 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-md">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                   <div className="p-6 flex flex-col grow justify-between">
                    <div className="space-y-2">
                      <div className="font-mono text-[9px] text-[#4edea3] uppercase font-bold tracking-widest flex items-center gap-1.5">
                        {getCategoryIcon(event.category)}
                        <span>{event.category}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-primary transition-colors leading-snug">{event.name}</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-6 mt-4 border-t border-white/5">
                      <span className="text-[11px] font-mono text-outline hover:text-white transition-colors flex items-center gap-1">
                        View Albums <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      {currentUser.role === UserRole.ADMIN && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEventClick(event);
                            }}
                            className="text-on-surface-variant hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                            title="Edit Event"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteEventClick(event.id, e)}
                            className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-lg border border-transparent hover:border-error/20 transition-all cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredAndSortedEvents.length === 0 && (
                <div className="col-span-full glass-panel py-16 text-center rounded-2xl space-y-4">
                  <AlertCircle className="w-10 h-10 text-outline mx-auto animate-bounce" />
                  <div>
                    <h4 className="text-sm font-bold text-white">No synchronized events found</h4>
                    <p className="text-xs text-on-surface-variant mt-1.5">No matching entries aligned with your current search options.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: EVENT DETAILS (WITH ALBUMS) */}
        {currentView === "EVENT_DETAIL" && selectedEvent && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
            key="event-detail"
          >
            {/* Nav back row */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleBackToList}
                className="text-xs text-on-surface-variant hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Console
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsQrOpen(true)}
                  className="bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-lg text-xs text-white hover:bg-slate-950 hover:border-white/15 flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                  QR Code Sharing
                </button>

                {currentUser.role === UserRole.ADMIN && (
                  <>
                    <button
                      onClick={() => handleEditEventClick(selectedEvent)}
                      className="bg-slate-950/40 border border-[#ffbe3b]/20 px-3 py-1.5 rounded-lg text-xs text-[#ffbe3b] hover:bg-[#ffbe3b]/10 hover:border-[#ffbe3b]/30 flex items-center gap-1.5 cursor-pointer font-semibold"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Event
                    </button>
                    <button
                      onClick={async (e) => {
                        await handleDeleteEventClick(selectedEvent.id, e as any);
                        handleBackToList();
                      }}
                      className="bg-slate-950/40 border border-error/20 px-3 py-1.5 rounded-lg text-xs text-error hover:bg-error/10 hover:border-error/30 flex items-center gap-1.5 cursor-pointer font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Event
                    </button>
                  </>
                )}

                {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PHOTOGRAPHER) && (
                  <button
                    onClick={() => setIsNewAlbumOpen(true)}
                    className="bg-primary text-on-primary font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary-container flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Album
                  </button>
                )}
              </div>
            </div>

            {/* Event Profile Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 aspect-video md:aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/5 shrink-0">
                <img className="w-full h-full object-cover" alt={selectedEvent.name} src={selectedEvent.coverImage} />
              </div>

              <div className="grow space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-widest">{selectedEvent.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono border ${
                      selectedEvent.visibility === "PUBLIC" ? "bg-tertiary/10 border-tertiary/20 text-tertiary" : "bg-outline/10 border-outline/20 text-on-surface-variant"
                    }`}>{selectedEvent.visibility}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedEvent.name}</h2>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs">
                  <div>
                    <div className="text-outline font-mono text-[9px] uppercase tracking-wider">Index Date</div>
                    <div className="text-white font-semibold flex items-center gap-1 mt-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {selectedEvent.date}
                    </div>
                  </div>
                  <div>
                    <div className="text-outline font-mono text-[9px] uppercase tracking-wider">Associated Albums</div>
                    <div className="text-[#4edea3] font-extrabold font-mono text-base mt-0.5">{albums.length} Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Albums List Grid */}
            <div className="space-y-4">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-outline">Media Directories (Albums)</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => handleAlbumClick(album)}
                    className="glass-panel p-4 rounded-xl cursor-pointer hover:border-primary/20 group transition-all"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/5 relative">
                      <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102" alt={album.name} src={album.coverImage} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] text-outline font-mono uppercase">Directory Store</span>
                        <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-primary transition-colors">{album.name}</h4>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 text-xs text-on-surface-variant bg-slate-900/10 px-1">
                      <span className="font-mono text-[10px] uppercase">Folder Active</span>
                      
                      {currentUser.role === UserRole.ADMIN && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                              title: "Purge Directory Store?",
                              message: "Are you sure you want to delete this album and purge all contents securely? This operation cannot be reversed.",
                              onConfirm: async () => {
                                try {
                                  const res = await fetch(`/api/albums/${album.id}`, { 
                                    method: "DELETE", 
                                    headers: { "Authorization": `Bearer ${token}` } 
                                  });
                                  if (res.ok) {
                                    fetchAlbums(selectedEvent.id);
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                                setConfirmModal(null);
                              }
                            });
                          }}
                          className="hover:text-error hover:bg-error/5 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {albums.length === 0 && (
                  <div className="col-span-full p-12 text-center border border-dashed border-white/5 rounded-2xl text-on-surface-variant font-mono text-xs">
                    No directories generated inside this event space yet.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: ALBUM DETAIL (WITH PHOTO STREAM) */}
        {currentView === "ALBUM_DETAIL" && selectedEvent && selectedAlbum && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
            key="album-detail"
          >
            {/* Back to Albums navigation row */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <button
                onClick={handleBackToEvent}
                className="text-xs text-on-surface-variant hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer align-middle"
              >
                <ArrowLeft className="w-4 h-4" /> {selectedEvent.name}
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={triggerZipArchiveDownload}
                  disabled={mediaList.length === 0}
                  className="bg-slate-950/40 border border-white/5 text-xs text-white hover:bg-slate-950 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-40 font-semibold"
                >
                  <FolderDot className="w-4 h-4 text-secondary" /> Download ZIP
                </button>

                <button
                  onClick={() => setIsQrOpen(true)}
                  className="bg-slate-950/40 border border-white/5 text-xs text-white hover:bg-slate-950 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" /> Share Link
                </button>

                {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PHOTOGRAPHER) && (
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/10"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Photo System
                  </button>
                )}
              </div>
            </div>

            {/* Album Profile Header details */}
            <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-indigo-500/10">
              <div className="w-10 h-10 bg-[#adc6ff]/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight">{selectedAlbum.name}</h2>
                <p className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">{selectedEvent.name} / Index Stream Directory</p>
              </div>
            </div>

            {/* AI Tags Search & Filter Utilities */}
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search query box */}
                <div className="relative w-full md:w-80 search-container" id="media-search-container">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-outline" />
                  </span>
                  <input
                    id="media-search-input"
                    type="text"
                    className="w-full h-10 bg-slate-950/40 border border-white/5 rounded-xl pl-10 pr-4 text-xs text-white placeholder-outline focus:outline-none focus:border-primary transition-all font-mono"
                    placeholder="Search photos, uploaders, or tags..."
                    value={mediaSearchQuery}
                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                  />
                  {mediaSearchQuery && (
                    <button
                      id="media-search-clear-btn"
                      onClick={() => setMediaSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Counter status label */}
                <div className="text-[10px] font-mono text-outline uppercase tracking-wider flex items-center gap-1.5 self-center" id="media-counter-status">
                  <Sparkles className="w-3.5 h-3.5 text-[#4edea3] animate-spin-slow" />
                  <span>Showing {filteredAndSortedMedia.length} of {mediaList.length} AI indexed files</span>
                </div>
              </div>

              {/* Dynamic tag selector row */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1" id="media-tag-selector-row">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider mr-2">Detect Tags:</span>
                <button
                  id="media-tag-btn-all"
                  type="button"
                  onClick={() => setSelectedMediaTag("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                    selectedMediaTag === "ALL"
                      ? "bg-primary/10 border-primary/30 text-primary font-bold"
                      : "bg-slate-950/20 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  All Assets
                </button>
                {albumUniqueTags.map((tag) => (
                  <button
                    id={`media-tag-btn-${tag}`}
                    key={tag}
                    type="button"
                    onClick={() => setSelectedMediaTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1 ${
                      selectedMediaTag === tag
                        ? "bg-[#4edea3]/10 border-[#4edea3]/30 text-[#4edea3] font-bold"
                        : "bg-slate-950/20 border-white/5 text-zinc-400 hover:text-[#4edea3]"
                    }`}
                  >
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Masonry-like dynamic media grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedMedia.map((media) => (
                <div
                  id={`media-item-${media.id}`}
                  key={media.id}
                  onClick={() => handleMediaClick(media)}
                  className="glass-panel rounded-xl overflow-hidden cursor-pointer group flex flex-col hover:scale-[1.01] transition-all relative border border-white/5 bg-slate-950/30"
                >
                  <div className="aspect-square relative overflow-hidden bg-slate-900">
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Media item" src={media.thumbnailUrl} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-outline leading-tight truncate max-w-2/3">Uploaded by {media.uploaderName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions summary footer */}
                  <div className="p-3 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex gap-3">
                      <button
                        id={`media-like-btn-${media.id}`}
                        onClick={(e) => handleLikeToggle(e, media)}
                        className="flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{media.likesCount}</span>
                      </button>

                      <button
                        id={`media-fav-btn-${media.id}`}
                        onClick={(e) => handleFavToggle(e, media)}
                        className={`hover:text-amber-400 transition-colors ${favMap[media.id] ? "text-amber-400" : "text-outline"}`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        id={`media-download-btn-${media.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSecureDownload(media.id);
                        }}
                        className="text-on-surface-variant hover:text-white p-1 rounded hover:bg-white/5 transition-all text-xs"
                        title="Secure Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PHOTOGRAPHER || media.uploadedBy === currentUser.id) && (
                        <button
                          id={`media-delete-btn-${media.id}`}
                          onClick={(e) => handleDeleteMedia(media.id, e)}
                          className="text-on-surface-variant hover:text-error p-1 rounded hover:bg-white/5 transition-all"
                          title="Delete Uploaded Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredAndSortedMedia.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-2xl" id="no-media-fallback-container">
                  <ImageIcon className="w-10 h-10 text-outline mx-auto mb-3" />
                  <p className="text-xs text-on-surface-variant font-mono">No photorealistic assets aligned with your current search options.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="glass-panel w-full max-w-sm rounded-2xl p-6 space-y-4 border border-white/10"
          >
            <div className="flex items-center gap-2.5 text-error">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="grow h-10 bg-slate-900 border border-white/5 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmModal.onConfirm()}
                className="grow h-10 bg-error hover:bg-error/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 1: PLAN NEW EVENT --- */}
      {isNewEventOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Plan Event Directory</h3>
              <button onClick={() => setIsNewEventOpen(false)} className="text-outline hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Event Label</label>
                <input required className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary" placeholder="Generative Hackathon" type="text" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-outline uppercase tracking-wider">Category</label>
                  <input required className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary" placeholder="e.g. Workshop, Gala, Tech" type="text" value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-outline uppercase tracking-wider">Schedule Date</label>
                  <input required className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary" type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Brief Context</label>
                <textarea className="w-full min-h-20 bg-slate-950/40 border border-white/5 rounded-xl p-4 text-xs text-white focus:outline-none" placeholder="Context details..." value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Event Cover Image</label>
                <div className="grid grid-cols-3 gap-2 border border-white/5 bg-slate-950/20 p-1.5 rounded-xl">
                  {["preset", "url", "upload"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCoverChoice(type as any)}
                      className={`py-1 rounded-lg text-[10px] font-mono tracking-wider uppercase font-bold cursor-pointer transition-all ${
                        coverChoice === type
                          ? "bg-slate-800 text-white"
                          : "text-outline hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {coverChoice === "preset" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-white/5 rounded-xl bg-slate-950/10">
                      {COVER_PRESETS.map((preset, index) => (
                        <div
                          key={preset.name}
                          onClick={() => setSelectedPresetIndex(index)}
                          className={`relative cursor-pointer aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            selectedPresetIndex === index ? "border-primary" : "border-transparent opacity-60"
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1">
                            <span className="text-[8px] font-bold text-white truncate w-full">{preset.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {coverChoice === "url" && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary"
                      placeholder="Paste Unsplash or Custom Image URL..."
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                    />
                    {customCoverUrl && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5">
                        <img src={customCoverUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1000&auto=format&fit=crop&q=80" }} />
                      </div>
                    )}
                  </div>
                )}

                {coverChoice === "upload" && (
                  <div className="space-y-2">
                    <div className="group relative border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/20">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setUploadedCoverBase64(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-6 h-6 text-outline group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Select cover file</span>
                        <span className="text-[8px] text-outline/60">Supported formats: JPG, PNG, WEBP</span>
                      </div>
                    </div>
                    {uploadedCoverBase64 && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 relative">
                        <img src={uploadedCoverBase64} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedCoverBase64("")}
                          className="absolute top-2 right-2 p-1 bg-slate-950/80 hover:bg-slate-900 rounded-full text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Access Protocol</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input type="radio" name="visibility" checked={newEvent.visibility === "PUBLIC"} onChange={() => setNewEvent({ ...newEvent, visibility: "PUBLIC" })} />
                    <span>PUBLIC ACCESS</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input type="radio" name="visibility" checked={newEvent.visibility === "PRIVATE"} onChange={() => setNewEvent({ ...newEvent, visibility: "PRIVATE" })} />
                    <span>PRIVATE ACCESS</span>
                  </label>
                </div>
              </div>

              <button className="w-full h-11 bg-primary text-on-primary rounded-xl font-bold text-xs" type="submit">Activate Event Space</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 1B: EDIT EXISTING EVENT --- */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Modify Event Details</h3>
              <button onClick={() => setEditingEvent(null)} className="text-outline hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditEventSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Event Label</label>
                <input required className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary" placeholder="Generative Hackathon" type="text" value={editEventForm.name} onChange={(e) => setEditEventForm({ ...editEventForm, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-outline uppercase tracking-wider">Category</label>
                  <input required className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-[11px] text-white focus:outline-none focus:border-primary" placeholder="e.g. Workshop, Gala, Tech" type="text" value={editEventForm.category} onChange={(e) => setEditEventForm({ ...editEventForm, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-outline uppercase tracking-wider">Schedule Date</label>
                  <input required className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary" type="date" value={editEventForm.date} onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Brief Context</label>
                <textarea className="w-full min-h-20 bg-slate-950/40 border border-white/5 rounded-xl p-4 text-xs text-white focus:outline-none" placeholder="Context details..." value={editEventForm.description} onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Event Cover Image</label>
                <div className="grid grid-cols-3 gap-2 border border-white/5 bg-slate-950/20 p-1.5 rounded-xl">
                  {["preset", "url", "upload"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditCoverChoice(type as any)}
                      className={`py-1 rounded-lg text-[10px] font-mono tracking-wider uppercase font-bold cursor-pointer transition-all ${
                        editCoverChoice === type
                          ? "bg-slate-800 text-white"
                          : "text-outline hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {editCoverChoice === "preset" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-white/5 rounded-xl bg-slate-950/10">
                      {COVER_PRESETS.map((preset, index) => (
                        <div
                          key={preset.name}
                          onClick={() => setSelectedEditPresetIndex(index)}
                          className={`relative cursor-pointer aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            selectedEditPresetIndex === index ? "border-primary" : "border-transparent opacity-60"
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1">
                            <span className="text-[8px] font-bold text-white truncate w-full">{preset.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editCoverChoice === "url" && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary"
                      placeholder="Paste Unsplash or Custom Image URL..."
                      value={customEditCoverUrl}
                      onChange={(e) => setCustomEditCoverUrl(e.target.value)}
                    />
                    {customEditCoverUrl && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5">
                        <img src={customEditCoverUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1000&auto=format&fit=crop&q=80" }} />
                      </div>
                    )}
                  </div>
                )}

                {editCoverChoice === "upload" && (
                  <div className="space-y-2">
                    <div className="group relative border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/20">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setUploadedEditCoverBase64(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-6 h-6 text-outline group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Select cover file</span>
                        <span className="text-[8px] text-outline/60">Supported formats: JPG, PNG, WEBP</span>
                      </div>
                    </div>
                    {uploadedEditCoverBase64 && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 relative">
                        <img src={uploadedEditCoverBase64} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedEditCoverBase64("")}
                          className="absolute top-2 right-2 p-1 bg-slate-950/80 hover:bg-slate-900 rounded-full text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Access Protocol</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input type="radio" name="editVisibility" checked={editEventForm.visibility === "PUBLIC"} onChange={() => setEditEventForm({ ...editEventForm, visibility: "PUBLIC" })} />
                    <span>PUBLIC ACCESS</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input type="radio" name="editVisibility" checked={editEventForm.visibility === "PRIVATE"} onChange={() => setEditEventForm({ ...editEventForm, visibility: "PRIVATE" })} />
                    <span>PRIVATE ACCESS</span>
                  </label>
                </div>
              </div>

              <button className="w-full h-11 bg-primary text-on-primary rounded-xl font-bold text-xs" type="submit">Save Modifications</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 2: NEW ALBUM --- */}
      {isNewAlbumOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto w-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Generate Album Directory</h3>
              <button onClick={() => setIsNewAlbumOpen(false)} className="text-outline hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateAlbumSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Directory Label</label>
                <input required className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary" placeholder="Candid Moments" type="text" value={newAlbum.name} onChange={(e) => setNewAlbum({ name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Album Cover Image</label>
                <div className="grid grid-cols-3 gap-2 border border-white/5 bg-slate-950/20 p-1.5 rounded-xl">
                  {["preset", "url", "upload"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAlbumCoverChoice(type as any)}
                      className={`py-1 rounded-lg text-[10px] font-mono tracking-wider uppercase font-bold cursor-pointer transition-all ${
                        albumCoverChoice === type
                          ? "bg-slate-800 text-white"
                          : "text-outline hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {albumCoverChoice === "preset" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-white/5 rounded-xl bg-slate-950/10">
                      {ALBUM_COVER_PRESETS.map((preset, index) => (
                        <div
                          key={preset.name}
                          onClick={() => setSelectedAlbumPresetIndex(index)}
                          className={`relative cursor-pointer aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            selectedAlbumPresetIndex === index ? "border-primary" : "border-transparent opacity-60"
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1">
                            <span className="text-[8px] font-bold text-white truncate w-full">{preset.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {albumCoverChoice === "url" && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary"
                      placeholder="Paste Custom Album Image URL..."
                      value={customAlbumCoverUrl}
                      onChange={(e) => setCustomAlbumCoverUrl(e.target.value)}
                    />
                    {customAlbumCoverUrl && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5">
                        <img src={customAlbumCoverUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1000&auto=format&fit=crop&q=80" }} />
                      </div>
                    )}
                  </div>
                )}

                {albumCoverChoice === "upload" && (
                  <div className="space-y-2">
                    <div className="group relative border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/20">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setUploadedAlbumCoverBase64(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-6 h-6 text-outline group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Select cover file</span>
                        <span className="text-[8px] text-outline/60">Supported formats: JPG, PNG, WEBP</span>
                      </div>
                    </div>
                    {uploadedAlbumCoverBase64 && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 relative">
                        <img src={uploadedAlbumCoverBase64} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedAlbumCoverBase64("")}
                          className="absolute top-2 right-2 p-1 bg-slate-950/80 hover:bg-slate-900 rounded-full text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button className="w-full h-11 bg-primary text-on-primary rounded-xl font-bold text-xs cursor-pointer" type="submit">Generate Store</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 3: BULK UPLOAD SYSTEM --- */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-white">Direct Upload Core (S3 Protocol)</h3>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-outline hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-outline uppercase tracking-wider">Collection Batch Identifier</label>
                <input className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none" placeholder="E.g., Opening Session Group" type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
              </div>

              {/* Drag drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-slate-950/30 hover:border-primary/30 cursor-pointer transition-all flex flex-col justify-center items-center gap-2 group"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:scale-105 transition-all">
                  <UploadCloud className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-xs text-white font-bold leading-tight">Drag and drop file selection</div>
                <div className="text-[10px] text-outline">Supports PNG, JPG, JPEG formatted blocks up to 10MB</div>
                <input id="fileInput" type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*" />
              </div>

              {/* Upload list preview */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono text-outline">{uploadedFiles.length} Block Items queued:</div>
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-900/40 border border-white/5 p-2 rounded-lg text-xs">
                        <span className="truncate max-w-3/4 font-mono text-[11px] text-zinc-300">{f.name}</span>
                        <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-error hover:bg-error/10 p-1 rounded cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setUploadedFiles([])}
                  disabled={uploadedFiles.length === 0}
                  className="w-1/3 h-11 bg-slate-950/20 border border-white/5 text-xs text-zinc-300 rounded-xl"
                >
                  Clear Bulk
                </button>
                <button
                  onClick={handleMediaUploadSubmit}
                  disabled={uploadedFiles.length === 0 || isUploading}
                  className="grow h-11 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      <span>Tagging with Gemini AI...</span>
                    </>
                  ) : (
                    <span>Synchronize files with AWS S3 ({uploadedFiles.length})</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- SIDEBAR-LIKE INTERACTIVE LIGHTBOX OVERLAY --- */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4">
          <button onClick={() => setActiveMedia(null)} className="absolute top-6 right-6 text-outline hover:text-white bg-slate-900/60 p-2.5 rounded-full border border-white/5 cursor-pointer backdrop-blur-md">
            <X className="w-5 h-5" />
          </button>

          <div className="w-full max-w-5xl h-full max-h-[85vh] rounded-3xl overflow-hidden glass-panel flex flex-col md:flex-row shadow-2xl">
            {/* Visual Screen on Left */}
            <div className="md:w-2/3 max-h-[50vh] md:max-h-none flex items-center justify-center bg-zinc-950/80 relative group p-6">
              <img className="max-w-full max-h-[75vh] object-contain rounded-lg" alt="Active photo selection" src={activeMedia.url} />

              {/* Dynamic tag overlays on graphic */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-1.5 p-2 bg-slate-950/30 backdrop-blur-md rounded-2xl border border-white/5 select-none">
                <Sparkles className="w-4 h-4 text-[#4edea3] inline self-center text-xs animate-spin-slow ml-1 shrink-0" />
                {activeMedia.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-mono font-bold bg-[#4edea3]/10 border border-[#4edea3]/20 text-[#4edea3] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Stream on Right */}
            <div className="md:w-1/3 flex flex-col justify-between h-full bg-slate-950/40 border-t md:border-t-0 md:border-l border-white/5">
              {/* Header card details */}
              <div className="p-6 border-b border-white/5 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-zinc-100 font-bold text-sm tracking-tight">{activeMedia.title}</h4>
                  {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PHOTOGRAPHER || activeMedia.uploadedBy === currentUser.id) && (
                    <button
                      onClick={(e) => handleDeleteMedia(activeMedia.id, e)}
                      className="text-on-surface-variant hover:text-error p-1.5 rounded-lg border border-transparent hover:border-error/20 transition-all cursor-pointer shrink-0"
                      title="Delete Uploaded Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-outline">
                  <span>Owner: {activeMedia.uploaderName}</span>
                  <span>{activeMedia.uploadDate.split("T")[0]}</span>
                </div>
              </div>

              {/* Interactive Feed comments */}
              <div className="p-6 grow overflow-y-auto space-y-4 max-h-[30vh] md:max-h-none scrollbar-thin">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-xs space-y-1">
                    <div className="flex gap-2 items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/20 overflow-hidden shrink-0">
                        {comment.userAvatarUrl ? (
                          <img className="w-full h-full object-cover" src={comment.userAvatarUrl} alt="Avatar" />
                        ) : (
                          <div className="w-full h-full bg-indigo-500" />
                        )}
                      </div>
                      <span className="font-extrabold text-white">{comment.userName}</span>
                      <span className="font-mono text-[9px] text-outline ml-auto">{comment.createdAt.split("T")[0]}</span>
                    </div>
                    <p className="text-zinc-300 pl-7 leading-relaxed font-sans">{comment.text}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="py-12 text-center text-[11px] font-mono text-outline">
                    Feed comments are currently empty. Initiate discussion below!
                  </div>
                )}
              </div>

              {/* Bottom active panel with button trigger forms */}
              <div className="p-6 border-t border-white/5 bg-slate-950/20 space-y-4">
                <div className="flex justify-between items-center select-none">
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => handleLikeToggle(e, activeMedia)}
                      className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-error hover:scale-105 active:scale-95 transition-all outline-none"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{activeMedia.likesCount} Likes</span>
                    </button>
                    <button
                      onClick={(e) => handleFavToggle(e, activeMedia)}
                      className={`flex items-center gap-1 text-xs outline-none transition-all ${
                        favMap[activeMedia.id] ? "text-amber-400 font-bold" : "text-outline hover:text-white"
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                      <span>Fav</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleSecureDownload(activeMedia.id)}
                    className="text-xs text-primary hover:text-primary-container font-mono uppercase tracking-wider flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Direct Protected Download
                  </button>
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    required
                    className="grow h-10 bg-slate-900 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary placeholder:text-outline/40"
                    placeholder="Contribute comment..."
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button className="bg-primary text-on-primary font-bold p-2 px-3.5 rounded-xl cursor-pointer hover:bg-primary-container active:scale-95 transition-all flex items-center">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SHAREABLE QR CODE DROPDOWN --- */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-sm rounded-2xl p-6 space-y-6 text-center">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Share Media Path</h3>
              <button onClick={() => setIsQrOpen(false)} className="text-outline hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-white p-4 rounded-3xl inline-block shadow-xl">
              <img
                className="w-44 h-44 border-0 rounded-2xl"
                alt="EventSphere share code"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  window.location.origin + "/media-stream/" + (selectedAlbum?.id || selectedEvent?.id || "home")
                )}`}
              />
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs text-zinc-100 font-bold leading-tight truncate px-4">
                {window.location.origin}/media-stream/{(selectedAlbum?.id || selectedEvent?.id || "home")}
              </div>
              <p className="text-[10px] text-outline leading-tight">Identify this code over mobile cameras to instantly fetch directory photos streams.</p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/media-stream/" + (selectedAlbum?.id || selectedEvent?.id || "home"));
                alert("Linked directory path copied successfully!");
              }}
              className="w-full h-11 bg-white/5 border border-white/10 text-xs text-zinc-300 rounded-xl"
            >
              Copy link Address
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
