import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Image as ImageIcon, User, Calendar, FolderOpen, 
  Sparkles, Trash2, Clock, RefreshCw, Activity 
} from "lucide-react";
import { Activity as ActivityType } from "../types";

interface RecentActivityFeedProps {
  token: string;
}

export function RecentActivityFeed({ token }: RecentActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/activities", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [token]);

  // Helper to construct fancy relative times or clean formats
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffDays === 1) return "Yesterday";
      return new Date(isoString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "Recently";
    }
  };

  const getActivityIconAndColor = (type: string) => {
    switch (type) {
      case "UPLOAD":
        return {
          icon: <ImageIcon className="w-4 h-4 text-emerald-400" />,
          bgColor: "bg-emerald-500/10 border-emerald-500/20",
          textColor: "text-emerald-400"
        };
      case "PROFILE_UPDATE":
        return {
          icon: <User className="w-4 h-4 text-sky-400" />,
          bgColor: "bg-sky-500/10 border-sky-500/20",
          textColor: "text-sky-400"
        };
      case "EVENT_CREATE":
        return {
          icon: <Calendar className="w-4 h-4 text-purple-400" />,
          bgColor: "bg-purple-500/10 border-purple-500/20",
          textColor: "text-purple-400"
        };
      case "ALBUM_CREATE":
        return {
          icon: <FolderOpen className="w-4 h-4 text-amber-400" />,
          bgColor: "bg-amber-500/10 border-amber-500/20",
          textColor: "text-amber-400"
        };
      case "SELFIE_UPLOAD":
        return {
          icon: <Sparkles className="w-4 h-4 text-pink-400" />,
          bgColor: "bg-pink-500/10 border-pink-500/20",
          textColor: "text-pink-400"
        };
      case "SELFIE_DELETE":
        return {
          icon: <Trash2 className="w-4 h-4 text-rose-400" />,
          bgColor: "bg-rose-500/10 border-rose-500/20",
          textColor: "text-rose-400"
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-zinc-400" />,
          bgColor: "bg-zinc-500/10 border-zinc-500/20",
          textColor: "text-zinc-400"
        };
    }
  };

  const getUserRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md";
      case "PHOTOGRAPHER":
        return "bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md";
      case "CLUB_MEMBER":
        return "bg-primary/10 border border-primary/20 text-primary text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md";
      default:
        return "bg-zinc-800 border border-white/5 text-outline text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md";
    }
  };

  return (
    <div id="recent-activity-panel" className="glass-panel p-6 rounded-2xl relative bg-slate-950/20 border border-white/5 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity Feed</h3>
            <p className="text-[10px] text-on-surface-variant">Real-time interaction stream across EventSphere</p>
          </div>
        </div>
        
        <button
          onClick={() => fetchActivities(true)}
          disabled={loading || refreshing}
          className="p-1.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/3 text-outline hover:text-white transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Panel Content */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <span className="text-[10px] font-mono text-outline">Loading interaction stream...</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-12 text-center text-outline text-xs">
          No activities recorded yet.
        </div>
      ) : (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 select-text scrollbar-thin">
          {activities.map((act, index) => {
            const config = getActivityIconAndColor(act.type);
            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.4) }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 border border-transparent hover:border-white/5 transition-all text-left"
              >
                {/* Event Type Icon */}
                <div className={`p-2 rounded-xl border ${config.bgColor} mt-0.5 shrink-0`}>
                  {config.icon}
                </div>

                {/* Content info */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-zinc-100 font-bold text-xs">{act.userName}</span>
                    <span className={getUserRoleBadge(act.userRole)}>{act.userRole}</span>
                    
                    <span className="ml-auto text-[10px] font-mono text-outline flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-outline/50" />
                      {getRelativeTime(act.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-on-surface-variant leading-relaxed break-words font-medium">
                    {act.details}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
