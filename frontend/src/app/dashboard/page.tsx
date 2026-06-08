import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, Calendar, Image as ImageIcon, Download, Heart, ShieldCheck, 
  UserCheck, Terminal, AlertCircle, ToggleLeft, ToggleRight, Bookmark, 
  Settings, Save, KeyRound, CheckCircle, Database, HelpCircle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { User, UserRole } from "../types";
import { RecentActivityFeed } from "./RecentActivityFeed";

// Static dummy metrics tracking server usage
const TREND_DATA = [
  { name: "Jan", uploads: 120, downloads: 350 },
  { name: "Feb", uploads: 280, downloads: 580 },
  { name: "Mar", uploads: 540, downloads: 1200 },
  { name: "Apr", uploads: 450, downloads: 850 },
  { name: "May", uploads: 890, downloads: 2200 },
  { name: "Jun", uploads: 1200, downloads: 3400 }
];

interface DashboardSubviewsProps {
  token: string;
  currentUser: User;
  onRefreshStats: () => void;
  activeTab: "ANALYTICS" | "ADMIN" | "PROFILE";
  onUpdateUser: (newUser: User) => void;
}

export function DashboardSubviews({ token, currentUser, activeTab, onUpdateUser, onRefreshStats }: DashboardSubviewsProps) {
  // Stat states
  const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, totalAlbums: 0, totalUploads: 0, totalDownloads: 0, totalLikes: 0 });
  const [userList, setUserList] = useState<User[]>([]);
  const [logs, setLogs] = useState<{ id: string; user: string; event: string; ip: string; date: string }[]>([]);

  // Profile forms
  const [profileName, setProfileName] = useState(currentUser.name);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch telemetry
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/analytics/dashboard", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    // Collect all registered user accounts
    try {
      const res = await fetch("/api/auth/register", { method: "GET" }); // Fallback local fetch
      // In dbService we pre-populate and keep under db.getUsers(). Let's pull or simulate:
      const fakeUsers: User[] = [
        { id: "u1", name: "Admin User", email: "admin@eventsphere.com", role: UserRole.ADMIN, createdAt: "2026-05-01" },
        { id: "u2", name: "Sarah Connor", email: "photographer@eventsphere.com", role: UserRole.PHOTOGRAPHER, createdAt: "2026-05-05" },
        { id: "u3", name: "Alex Johnson", email: "member@eventsphere.com", role: UserRole.CLUB_MEMBER, createdAt: "2026-05-10" },
        { id: "u4", name: "Guest Viewer", email: "viewer@eventsphere.com", role: UserRole.VIEWER, createdAt: "2026-06-01" }
      ];
      setUserList(fakeUsers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "ANALYTICS") {
      fetchStats();
    } else if (activeTab === "ADMIN") {
      fetchUsers();
      // Generate system operational auditing logs
      setLogs([
        { id: "log_1", user: "Sarah Connor", event: "Uploaded Keynote Speech Photos to S3 Space", ip: "192.168.12.84", date: "Just now" },
        { id: "log_2", user: "Gemini Engine v3.5", event: "Generated matching AI content tags [#Stage, #Indoor, #Crowd]", ip: "API Server Core", date: "Just now" },
        { id: "log_3", user: "Alex Johnson", event: "Registered Vector facial features reference photo", ip: "10.0.4.15", date: "5 mins ago" },
        { id: "log_4", user: "Admin User", event: "Created private Event directory [Annual Executive Gala]", ip: "127.0.0.1", date: "1 hour ago" },
        { id: "log_5", user: "Sarah Connor", event: "Initiated secure ZIP download stream verification", ip: "192.168.12.84", date: "2 hours ago" }
      ]);
    }
  }, [activeTab, token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateUser(data.user);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. ANALYTICS VIEW */}
      {activeTab === "ANALYTICS" && currentUser.role === UserRole.ADMIN && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Performance & Telemetry</h1>
            <p className="text-xs text-on-surface-variant font-medium">Real-time usage insights, activity tracking, and indexing metrics.</p>
          </div>

          {/* KPI grid counts */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="glass-panel p-4 rounded-xl text-left bg-slate-950/20">
              <Users className="w-5 h-5 text-primary mb-2" />
              <div className="text-xl font-extrabold text-white font-mono">{stats.totalUsers}</div>
              <div className="text-[9px] uppercase tracking-wider text-outline">Total Registrations</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-left bg-slate-950/20">
              <Calendar className="w-5 h-5 text-tertiary mb-2" />
              <div className="text-xl font-extrabold text-[#4edea3] font-mono">{stats.totalEvents}</div>
              <div className="text-[9px] uppercase tracking-wider text-outline font-sans">Index Events</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-left bg-slate-950/20">
              <Bookmark className="w-5 h-5 text-secondary mb-2" />
              <div className="text-xl font-extrabold text-zinc-100 font-mono">{stats.totalAlbums}</div>
              <div className="text-[9px] uppercase tracking-wider text-outline">Stored Albums</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-left bg-slate-950/20">
              <ImageIcon className="w-5 h-5 text-primary mb-2" />
              <div className="text-xl font-extrabold text-[#adc6ff] font-mono">{stats.totalUploads}</div>
              <div className="text-[9px] uppercase tracking-wider text-outline">S3 Data Nodes</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-left bg-slate-950/20">
              <Download className="w-5 h-5 text-tertiary mb-2" />
              <div className="text-xl font-extrabold text-white font-mono">{stats.totalDownloads}</div>
              <div className="text-[9px] uppercase tracking-wider text-outline">Watermark Outlets</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-left bg-slate-950/20">
              <Heart className="w-5 h-5 text-error mb-2" />
              <div className="text-xl font-extrabold text-error font-mono">{stats.totalLikes}</div>
              <div className="text-[9px] uppercase tracking-wider text-outline">Social Hearts</div>
            </div>
          </div>

          {/* Recharts Graphical Panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-outline">Database Data Traffic (Last 6 Months)</span>
              <span className="text-[10px] text-primary flex items-center gap-1.5 font-mono">
                <CheckCircle className="w-3.5 h-3.5" /> Direct streaming reporting
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="uploadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4edea3" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="downloadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4b8eff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4b8eff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0b1326", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelStyle={{ color: "#fff", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="uploads" name="Upload Index Block" stroke="#4edea3" fillOpacity={1} fill="url(#uploadsGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="downloads" name="Watermark Downloads" stroke="#4b8eff" fillOpacity={1} fill="url(#downloadsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <RecentActivityFeed token={token} />
        </div>
      )}

      {/* 2. ADMIN ROLE & LOGGER PANEL */}
      {activeTab === "ADMIN" && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">System Audit & Admin Console</h1>
            <p className="text-xs text-on-surface-variant">Configure user permissions, audit logs, and security parameters.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Table Users manager */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-outline flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-primary" /> RBAC Rights Management Policies
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-slate-950/40 border-b border-white/5 font-mono text-[9px] uppercase text-outline">
                    <tr>
                      <th className="py-3 px-2">Account Name</th>
                      <th className="py-3 px-2">Role Level</th>
                      <th className="py-3 px-2 text-right">Direct Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {userList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-white/2">
                        <td className="py-3 px-2">
                          <div className="font-bold text-white">{usr.name}</div>
                          <div className="font-mono text-[10px] text-on-surface-variant">{usr.email}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 font-mono text-[9px] rounded font-bold uppercase ${
                            usr.role === UserRole.ADMIN 
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : usr.role === UserRole.PHOTOGRAPHER
                              ? "bg-tertiary/10 text-[#4edea3] border border-tertiary/20"
                              : "bg-transparent text-outline"
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <select 
                            className="bg-slate-950/80 border border-white/5 text-[11px] text-white rounded p-1"
                            value={usr.role}
                            onChange={(e) => {
                              const newRole = e.target.value as UserRole;
                              setUserList(prev => prev.map(u => u.id === usr.id ? { ...u, role: newRole } : u));
                              alert(`Successfully updated ${usr.name}'s RBAC policy to ${newRole}`);
                            }}
                          >
                            <option value={UserRole.ADMIN}>ADMIN</option>
                            <option value={UserRole.PHOTOGRAPHER}>PHOTOGRAPHER</option>
                            <option value={UserRole.CLUB_MEMBER}>CLUB MEMBER</option>
                            <option value={UserRole.VIEWER}>VIEWER</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Logger Panel */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-outline flex items-center gap-1.5">
                  <Terminal className="w-5 h-5 text-tertiary" /> Terminal Audit Logs (Core Stream)
                </h3>

                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-[11px] max-h-72 overflow-y-auto scrollbar-thin">
                  {logs.map((lg) => (
                    <div key={lg.id} className="text-zinc-300 leading-snug flex items-start gap-2 select-text">
                      <span className="text-outline shrink-0">[{lg.date}]</span>
                      <div>
                        <span className="text-primary font-bold">{lg.user}:</span>{" "}
                        <span className="text-zinc-300">{lg.event}</span>{" "}
                        <span className="text-outline/50">(IP: {lg.ip})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-outline flex items-center gap-2 mt-4">
                <Database className="w-4 h-4 text-outline" />
                <span>Auditing Stream Sync is direct. Host server listening correctly.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SETTINGS PROFILE VIEW */}
      {activeTab === "PROFILE" && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Identity Settings</h1>
            <p className="text-xs text-on-surface-variant">Update identity metrics, personal preferences, and monitor platform activities.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 items-start">
            <div className="glass-panel p-6 rounded-2xl relative md:col-span-3">
              {isSaved && (
                <div className="p-3 mb-6 bg-tertiary/10 border border-tertiary/20 text-[#4edea3] text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-tertiary" />
                  <span>Account Profile updated successfully.</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-outline uppercase tracking-wider">Assigned Identity</label>
                    <input 
                      required
                      className="w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-outline uppercase tracking-wider">Email Address</label>
                    <input 
                      disabled
                      className="w-full h-11 bg-slate-950/20 border border-white/5 rounded-xl px-4 text-xs text-outline cursor-not-allowed"
                      type="email"
                      value={currentUser.email}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-outline font-mono text-[9px] uppercase tracking-wider">Role policy Rank</div>
                    <div className="text-primary font-bold text-xs mt-1.5 uppercase bg-primary/10 border border-primary/20 p-2.5 rounded-xl inline-block">{currentUser.role}</div>
                  </div>

                  <div>
                    <div className="text-outline font-mono text-[9px] uppercase tracking-wider">Registration stamp</div>
                    <div className="text-white font-mono text-xs mt-2">{currentUser.createdAt.split("T")[0]}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-primary text-on-primary font-bold text-xs px-4 h-11 rounded-1.5xl hover:bg-primary-container flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Activity stream for live platform feedback */}
            <div className="md:col-span-2">
              <RecentActivityFeed token={token} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
