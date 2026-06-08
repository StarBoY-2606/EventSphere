import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, LogOut, TrendingUp, UserCheck, Sparkles, Settings, 
  User as UserIcon, Calendar, Info, ShieldCheck, Mail, Database, HelpCircle
} from "lucide-react";
import { LandingPage } from "./components/LandingPage";
import { AuthPages } from "./components/AuthPages";
import { EventsView } from "./components/EventsView";
import { AIPhotosView } from "./components/AIPhotosView";
import { DashboardSubviews } from "./components/DashboardSubviews";
import { EventSphereLogo } from "./components/EventSphereLogo";
import { User, UserRole, Notification } from "./types";

type ViewState = "LANDING" | "AUTH" | "DASHBOARD";
type TabState = "EVENTS" | "FACE_SCAN" | "ANALYTICS" | "ADMIN" | "PROFILE";

export default function App() {
  // Authentication states
  const [viewState, setViewState] = useState<ViewState>("LANDING");
  const [authType, setAuthType] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("es_token"));

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabState>("EVENTS");

  // Notification stream states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Statistics summaries
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalEvents: 0, totalAlbums: 0, totalUploads: 0, totalDownloads: 0, totalLikes: 0 });

  // Sync session state from localStorage
  useEffect(() => {
    const fetchSession = async () => {
      if (token) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setCurrentUser(userData);
            setViewState("DASHBOARD");
          } else {
            // Expired token
            localStorage.removeItem("es_token");
            setToken(null);
            setViewState("LANDING");
          }
        } catch (e) {
          console.error("Session verification failed", e);
        }
      }
    };
    fetchSession();
  }, [token]);

  // Handle successful login
  const handleAuthSuccess = (user: User, userToken: string) => {
    localStorage.setItem("es_token", userToken);
    setToken(userToken);
    setCurrentUser(user);
    setViewState("DASHBOARD");
    setActiveTab("EVENTS");
  };

  // Logouts
  const handleLogout = () => {
    localStorage.removeItem("es_token");
    setToken(null);
    setCurrentUser(null);
    setViewState("LANDING");
  };

  // Real-time alerts indexer (Long-polling simulation matching SSE)
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSummaryTelemetry = async () => {
    if (!token || !currentUser || currentUser.role !== UserRole.ADMIN) return;
    try {
      const res = await fetch("/api/analytics/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token && viewState === "DASHBOARD") {
      fetchNotifications();
      fetchSummaryTelemetry();
      
      // Pull updates every 5 seconds to provide real-time-like updates
      const timer = setInterval(() => {
        fetchNotifications();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [token, viewState]);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] select-text">
      
      <AnimatePresence mode="wait">
        
        {/* LANDING PAGE */}
        {viewState === "LANDING" && (
          <LandingPage 
            onGetStarted={() => {
              setAuthType("REGISTER");
              setViewState("AUTH");
            }}
            onLogin={() => {
              setAuthType("LOGIN");
              setViewState("AUTH");
            }}
          />
        )}

        {/* AUTH CONSOLE SCREEN */}
        {viewState === "AUTH" && (
          <AuthPages 
            initialType={authType}
            onAuthSuccess={handleAuthSuccess}
            onToggleView={() => setAuthType(authType === "LOGIN" ? "REGISTER" : "LOGIN")}
          />
        )}

        {/* ACTIVE DASHBOARD */}
        {viewState === "DASHBOARD" && currentUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-screen bg-ink"
            key="dashboard"
          >
            {/* Nav side-rail menu drawer */}
            <aside className="w-64 bg-slate-950/40 border-r border-white/5 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
              <div className="space-y-8">
                {/* Branding */}
                <div 
                  onClick={() => setViewState("LANDING")}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <EventSphereLogo className="w-8 h-8" />
                  <span className="font-sans text-base font-extrabold text-white tracking-tight">EventSphere</span>
                </div>

                {/* Account card details summary */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden shrink-0 border border-white/10">
                    <img className="w-full h-full object-cover" src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`} alt="Primary Avatar" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                    <div className="font-mono text-[9px] text-[#4edea3] uppercase font-bold tracking-wider">{currentUser.role}</div>
                  </div>
                </div>

                {/* Sidebar Navigation items */}
                <nav className="space-y-1.5 select-none text-sm">
                  <button
                    onClick={() => setActiveTab("EVENTS")}
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === "EVENTS"
                        ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/10"
                        : "text-on-surface-variant hover:bg-white/3 hover:text-white"
                    }`}
                  >
                    <Calendar className="w-4.5 h-4.5" />
                    <span>Events Explorer</span>
                  </button>

                  {/* Facial Scan matches target views */}
                  <button
                    onClick={() => setActiveTab("FACE_SCAN")}
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === "FACE_SCAN"
                        ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/10"
                        : "text-on-surface-variant hover:bg-white/3 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>AI Facial Locator</span>
                  </button>

                  {/* Analytics charts toggle */}
                  {currentUser.role === UserRole.ADMIN && (
                    <button
                      onClick={() => setActiveTab("ANALYTICS")}
                      className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                        activeTab === "ANALYTICS"
                          ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/10"
                          : "text-on-surface-variant hover:bg-white/3 hover:text-white"
                      }`}
                    >
                      <TrendingUp className="w-4.5 h-4.5" />
                      <span>Stats & Telemetry</span>
                    </button>
                  )}

                  {/* Admin lists if role is proper */}
                  {currentUser.role === UserRole.ADMIN && (
                    <button
                      onClick={() => setActiveTab("ADMIN")}
                      className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                        activeTab === "ADMIN"
                          ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/10"
                          : "text-on-surface-variant hover:bg-white/3 hover:text-white"
                      }`}
                    >
                      <UserCheck className="w-4.5 h-4.5" />
                      <span>Security & Claims</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab("PROFILE")}
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === "PROFILE"
                        ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/10"
                        : "text-on-surface-variant hover:bg-white/3 hover:text-white"
                    }`}
                  >
                    <Settings className="w-4.5 h-4.5" />
                    <span>Identity Profile</span>
                  </button>
                </nav>
              </div>

              {/* Sidebar bottom logouts */}
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3.5 rounded-xl border border-white/5 hover:border-error/20 text-on-surface-variant hover:text-error hover:bg-error/5 cursor-pointer text-sm font-semibold transition-all flex items-center gap-3"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Sign Out Console</span>
              </button>
            </aside>

            {/* Main scroll body panels */}
            <main className="grow flex flex-col min-h-screen overflow-x-hidden relative">
              {/* Header search bar and notification dropdown alerts */}
              <header className="h-16 px-12 border-b border-white/5 flex justify-end items-center gap-6 sticky top-0 z-40 bg-ink/80 backdrop-blur-md">
                
                {/* Real-time Notifications trigger dropdown panel */}
                <div className="relative select-none">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 border border-white/5 hover:border-white/12 rounded-xl text-on-surface-variant hover:text-white transition-all cursor-pointer relative"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white font-mono text-[9px] rounded-full flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        {/* Overlay backdrop clicking closure */}
                        <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel p-4 z-20 space-y-4 shadow-xl"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-white/5 text-xs">
                            <span className="font-bold text-white uppercase tracking-wider">Feed Alerts</span>
                            {unreadCount > 0 && (
                              <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:text-primary-container font-semibold cursor-pointer">
                                Mark all check
                              </button>
                            )}
                          </div>

                          <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                            {notifications.map((n) => (
                              <div key={n.id} className="text-xs space-y-1 p-2 rounded-lg bg-slate-950/20 border border-white/3">
                                <p className={`text-zinc-300 leading-snug ${!n.read ? "font-bold text-white border-l-2 border-primary pl-2" : "pl-2"}`}>
                                  {n.message}
                                </p>
                                <div className="font-mono text-[8px] text-outline text-right mt-1">
                                  {n.createdAt.split("T")[0]}
                                </div>
                              </div>
                            ))}

                            {notifications.length === 0 && (
                              <div className="py-12 text-center text-[10px] text-outline font-mono">
                                Streaming notifications list is clean.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden shrink-0 border border-white/10">
                    <img className="w-full h-full object-cover" src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`} alt="Profile micro" />
                  </div>
                  <span className="text-xs font-bold text-white max-w-28 truncate">{currentUser.name}</span>
                </div>
              </header>

              {/* Renders Tab Panels with full context data */}
              <div className="grow p-12 max-w-7xl mx-auto w-full relative z-10 pb-20">
                {activeTab === "EVENTS" && (
                  <EventsView 
                    currentUser={currentUser} 
                    token={token!} 
                    onRefreshStats={fetchSummaryTelemetry}
                  />
                )}

                {activeTab === "FACE_SCAN" && (
                  <AIPhotosView 
                    currentUser={currentUser} 
                    token={token!}
                    onUpdateUser={(updated) => setCurrentUser(updated)}
                  />
                )}

                {(activeTab === "ANALYTICS" || activeTab === "ADMIN" || activeTab === "PROFILE") && (
                  <DashboardSubviews 
                    activeTab={activeTab as "ANALYTICS" | "ADMIN" | "PROFILE"}
                    currentUser={currentUser}
                    token={token!}
                    onUpdateUser={(updated) => setCurrentUser(updated)}
                    onRefreshStats={fetchSummaryTelemetry}
                  />
                )}
              </div>
            </main>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
