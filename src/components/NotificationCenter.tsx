import { Bell, BellRing, Check, Megaphone, PackageCheck, TriangleAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export function LiveToastStack() {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((toast) => {
        const accent =
          toast.tone === 'emerald'
            ? 'border-[#D4AF37] bg-white'
            : toast.tone === 'amber'
              ? 'border-[#D4AF37] bg-white'
              : toast.tone === 'rose'
                ? 'border-rose-300 bg-white'
                : 'border-[#AEC3B0] bg-white';

        const iconColor =
          toast.tone === 'emerald'
            ? 'bg-[#E3EED4] text-[#006837]'
            : toast.tone === 'amber'
              ? 'bg-[#F3E5AB]/50 text-[#B8860B]'
              : toast.tone === 'rose'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-[#E3EED4] text-[#004D2C]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-3.5 shadow-lg flex items-start gap-3 transition-transform ${accent}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
              <BellRing className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#004D2C] truncate">{toast.title}</p>
              <p className="text-xs text-[#006837] mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 text-[#3B7A57] hover:text-[#004D2C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { user } = useAuth();
  const {
    notifications,
    wsConnected,
    pushPermission,
    requestPushPermission,
    markNotificationRead,
  } = useStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#004D2C]/45 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <aside
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l-2 border-[#D4AF37]/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#AEC3B0]/50 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#004D2C]">Vinco &amp; More Live Alerts</h2>
            <p className="text-xs text-[#3B7A57] mt-0.5">
              {wsConnected ? 'Real-time push feed connected' : 'Reconnecting to live feed'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="min-w-[44px] min-h-[44px] rounded-full bg-[#E3EED4] hover:bg-[#D4AF37]/30 flex items-center justify-center text-[#004D2C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {pushPermission !== 'granted' && pushPermission !== 'unsupported' && (
          <div className="p-4 bg-[#E3EED4] border-b border-[#D4AF37]/50 flex items-center justify-between gap-3">
            <div className="text-xs text-[#004D2C]">
              <p className="font-semibold">Enable Browser Push Alerts</p>
              <p className="text-[#006837] mt-0.5">Get instant alerts for order dispatches and fresh restocks.</p>
            </div>
            <button
              type="button"
              onClick={() => void requestPushPermission()}
              className="px-3.5 py-2 rounded-xl bg-[#006837] text-white border border-[#D4AF37] text-xs font-semibold hover:bg-[#004D2C] whitespace-nowrap shrink-0"
            >
              Enable
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-[#AEC3B0]/40">
          {notifications.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-medium text-[#004D2C]">No notifications yet</p>
              <p className="text-xs text-[#3B7A57]">
                Order status updates and Vinco &amp; More drop promotions will appear here automatically.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isRead = item.readBy.includes(user.uid);
              const Icon =
                item.type === 'order_update'
                  ? PackageCheck
                  : item.type === 'low_stock'
                    ? TriangleAlert
                    : Megaphone;
              const iconBg =
                item.type === 'order_update'
                  ? 'bg-[#E3EED4] text-[#006837]'
                  : item.type === 'low_stock'
                    ? 'bg-[#F3E5AB]/50 text-[#B8860B]'
                    : 'bg-[#E3EED4] text-[#004D2C] border border-[#D4AF37]/50';

              return (
                <div
                  key={item.id}
                  className={`p-4 flex items-start gap-3 transition-colors ${isRead ? 'bg-white' : 'bg-[#E3EED4]/35'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#004D2C] truncate">{item.title}</p>
                      <span className="text-[11px] text-[#3B7A57] tabular-nums shrink-0">
                        {new Date(item.createdAtMs).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#006837] mt-1 leading-relaxed">{item.message}</p>
                    {!isRead && (
                      <button
                        type="button"
                        onClick={() => void markNotificationRead(item.id)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#006837] hover:underline"
                      >
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
