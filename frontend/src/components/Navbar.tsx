import React, { useState } from "react";
import { Bell, LogOut, User, Menu, X } from "lucide-react";
import { User as UserType, Notification } from "../app/types";
import { api } from "../utils/api";
import { clearToken } from "../utils/api";

interface NavbarProps {
  currentUser: UserType | null;
  notifications: Notification[];
  onLogout: () => void;
  onNotificationRead: () => void;
}

export default function Navbar({ currentUser, notifications, onLogout, onNotificationRead }: NavbarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      onNotificationRead();
    } catch {}
  };

  const handleLogout = () => {
    clearToken();
    onLogout();
  };

  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56, borderBottom: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)" }}>
      <span style={{ fontWeight: 600, fontSize: 18 }}>EventSphere</span>

      {currentUser && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifs(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              <Bell size={20} />
              {unread > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, background: "var(--color-text-danger)", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {unread}
                </span>
              )}
            </button>
            {showNotifs && (
              <div style={{ position: "absolute", right: 0, top: 36, width: 320, background: "var(--color-background-primary)", border: "1px solid var(--color-border-tertiary)", borderRadius: 10, zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--color-border-tertiary)" }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>Notifications</span>
                  <button onClick={handleMarkAllRead} style={{ fontSize: 11, color: "var(--color-text-info)", background: "none", border: "none", cursor: "pointer" }}>Mark all read</button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ padding: 16, fontSize: 13, color: "var(--color-text-secondary)", textAlign: "center" }}>No notifications</p>
                ) : notifications.slice(0, 8).map(n => (
                  <div key={n.id} style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border-tertiary)", opacity: n.read ? 0.6 : 1 }}>
                    <p style={{ fontSize: 12, margin: 0, color: "var(--color-text-primary)" }}>{n.message}</p>
                    <p style={{ fontSize: 11, margin: "2px 0 0", color: "var(--color-text-secondary)" }}>{new Date(n.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
            ) : (
              <User size={18} />
            )}
            <span style={{ fontSize: 13, fontWeight: 500 }}>{currentUser.name}</span>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-secondary)", fontSize: 13 }}>
            <LogOut size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
