import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, User as UserIcon, ShieldAlert, ArrowRight, Eye, EyeOff } from "lucide-react";
import { EventSphereLogo } from "./EventSphereLogo";
import { UserRole } from "../types";

interface AuthPagesProps {
  onAuthSuccess: (user: any, token: string) => void;
  onToggleView: () => void;
  initialType: "LOGIN" | "REGISTER";
}

export function AuthPages({ onAuthSuccess, onToggleView, initialType }: AuthPagesProps) {
  const [view, setView] = useState<"LOGIN" | "REGISTER">(initialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.CLUB_MEMBER);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = view === "LOGIN" ? "/api/auth/login" : "/api/auth/register";
    const body = view === "LOGIN" 
      ? { email, password } 
      : { name, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || "Request timed out, please verify input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-on-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Parallax Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />

      <main className="w-full max-w-[460px] relative z-10">
        {/* Logo Branding */}
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="mb-2"
          >
            <EventSphereLogo className="w-14 h-14" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">EventSphere</h1>
          <p className="text-xs text-on-surface-variant mt-1">AI-Powered Event & Media Management</p>
        </div>

        {/* Login / Register Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-8 glow-effect"
        >
          {error && (
            <div className="p-3 mb-6 bg-error-container/20 border border-error/20 text-error rounded-xl text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 text-error" />
              <span>{error}</span>
            </div>
          )}

          <h2 className="text-xl font-bold text-white mb-6">
            {view === "LOGIN" ? "Sign In to Console" : "Create Developer Persona"}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {view === "REGISTER" && (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4.5 h-4.5" />
                  <input
                    required
                    className="w-full h-12 bg-slate-950/40 border border-white/5 rounded-xl pl-12 pr-4 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary input-glow transition-all duration-200"
                    id="name"
                    placeholder="Enter your name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4.5 h-4.5" />
                <input
                  required
                  className="w-full h-12 bg-slate-950/40 border border-white/5 rounded-xl pl-12 pr-4 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary input-glow transition-all duration-200"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                {view === "LOGIN" && (
                  <a className="font-mono text-[10px] text-primary hover:text-primary-container transition-colors" href="#forgot">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4.5 h-4.5" />
                <input
                  required
                  className="w-full h-12 bg-slate-950/40 border border-white/5 rounded-xl pl-12 pr-12 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary input-glow transition-all duration-200"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {view === "REGISTER" && (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">
                  Assign Platform Role (RBAC Policy)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(UserRole) as Array<keyof typeof UserRole>).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(UserRole[r])}
                      className={`py-2 px-3 border text-xs font-semibold rounded-xl transition-all cursor-pointer text-center ${
                        role === UserRole[r]
                          ? "bg-primary border-primary text-on-primary shadow-sm"
                          : "bg-slate-950/20 border-white/5 text-on-surface-variant hover:border-white/10"
                      }`}
                    >
                      {r.replace("_", " ")}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-outline mt-2 leading-relaxed">
                  Roles permit varying levels of media capability: admins create event albums, photographers execute file uploads, members comment/scan faces.
                </p>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container active:scale-[0.98] disabled:opacity-50 transition-all duration-150 shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer mt-6"
              type="submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{view === "LOGIN" ? "Sign In to Client" : "Register Credentials"}</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
            <p className="text-xs text-on-surface-variant mb-3">
              {view === "LOGIN" ? "New to EventSphere?" : "Already part of the network?"}
            </p>
            <button
              onClick={() => {
                setError(null);
                setView(view === "LOGIN" ? "REGISTER" : "LOGIN");
              }}
              className="w-full h-12 bg-white/5 border border-white/10 text-on-surface font-semibold text-sm rounded-xl hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              {view === "LOGIN" ? "Create Identity" : "Login Instead"}
            </button>
          </div>
        </motion.div>

        {/* Footer info links */}
        <footer className="mt-8 flex justify-center space-x-6 text-[10px] font-mono tracking-wider text-outline">
          <a className="hover:text-on-surface transition-colors" href="#privacy">PRIVACY POLICY</a>
          <a className="hover:text-on-surface transition-colors" href="#terms">TERMS OF SERVICE</a>
          <a className="hover:text-on-surface transition-colors" href="#help">SUPPORT</a>
        </footer>
      </main>
    </div>
  );
}
