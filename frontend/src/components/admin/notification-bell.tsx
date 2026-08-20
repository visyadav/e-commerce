"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { signalRService, OrderNotificationPayload } from "@/src/services/notifications/signalr-service";
import { adminNotificationService, NotificationDto } from "@/src/services/notifications/admin-notification-service";

function playOrderChimeSound() {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1 (A5 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // Tone 2 (D6 1174Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    // Ignore audio restriction errors
  }
}

function formatActionUrl(url?: string): string {
  if (!url) return "/admin/orders";
  if (url === "/orders" || url.startsWith("/orders?")) {
    return url.replace("/orders", "/admin/orders");
  }
  if (!url.startsWith("/admin") && url.startsWith("/")) {
    return `/admin${url}`;
  }
  return url;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await adminNotificationService.getUnreadCount();
      setUnreadCount(res || 0);
    } catch {
      // Ignore count fetch errors
    }
  }, []);

  const fetchNotificationsList = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pass unreadOnly = true so only unread notifications are fetched
      const res = await adminNotificationService.getNotifications(true, 1, 15);
      if (res && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch {
      // Ignore list fetch errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Start SignalR Connection
    signalRService.startConnection();

    // Register Real-time SignalR Event Listener
    const unsubscribe = signalRService.onNewOrderPlaced((payload: OrderNotificationPayload) => {
      // 1. Play Audio Bell Chime
      playOrderChimeSound();

      // 2. Show Toast Alert
      toast.success(`🛒 New Order #${payload.orderNumber}`, {
        description: `Placed by ${payload.customerName} for ₹${payload.totalAmount}`,
        duration: 8000,
      });

      // 3. Increment Unread Badge Counter
      setUnreadCount((prev) => prev + 1);

      // 4. Prepend to Notifications List in memory
      const newNotif: NotificationDto = {
        id: payload.id,
        title: `New Order #${payload.orderNumber}`,
        message: payload.message,
        type: 0,
        isRead: false,
        actionUrl: `/admin/orders?orderId=${payload.id}`,
        createdAt: payload.createdAt || new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUnreadCount]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotificationsList();
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = (n: NotificationDto) => {
    setIsOpen(false);
    if (!n.isRead) {
      adminNotificationService.markAsRead(n.id).catch(() => {});
      setNotifications((prev) => prev.filter((item) => item.id !== n.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications([]);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Icon */}
      <button
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground transition-all hover:bg-accent focus:outline-none"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border bg-card p-4 shadow-2xl z-50 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto py-2 divide-y">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No unread notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={formatActionUrl(n.actionUrl)}
                  onClick={() => handleItemClick(n)}
                  className={`flex gap-3 p-2.5 rounded-lg transition-colors hover:bg-accent/50 ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="border-t pt-2 text-center">
            <Link
              href="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All Orders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
