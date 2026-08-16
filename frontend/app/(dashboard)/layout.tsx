"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket/client";
import { useSocketStore } from "@/store/socket-store";
import { useAuthStore } from "@/store/auth-store";
import { logout, refresh } from "@/lib/api/auth";
import { setAccessToken } from "@/lib/auth/tokens";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/documents", label: "Documents" },
  { href: "/purchase-orders", label: "Purchase Orders" },
  { href: "/activity", label: "Activity" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setConnected = useSocketStore((state) => state.setConnected);
  const user = useAuthStore((state) => state.user);
  const organization = useAuthStore((state) => state.organization);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clear);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // The access token lives in memory only (lib/auth/tokens.ts), so a hard
  // page load starts with none — rehydrate it (and the user for display)
  // from the httpOnly refresh cookie before rendering anything protected.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const session = await refresh();
        if (cancelled) return;
        setAccessToken(session.accessToken);
        setSession(session.user, session.organization);
        setIsBootstrapping(false);
      } catch {
        if (cancelled) return;
        // The proxy only checks cookie *presence*, not validity — clear it
        // server-side too, or an invalid cookie would bounce us right back
        // here from /login.
        await logout().catch(() => {});
        router.replace("/login");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isBootstrapping) return;

    const socket = getSocket();
    socket.connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [isBootstrapping, setConnected]);

  async function handleLogout() {
    await logout().catch(() => {});
    setAccessToken(null);
    clearSession();
    router.push("/login");
  }

  if (isBootstrapping) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r bg-sidebar text-sidebar-foreground">
        <nav className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2 border-t p-4">
          {organization && <div className="truncate text-sm font-medium">{organization.name}</div>}
          {user && <div className="truncate text-xs text-muted-foreground">{user.email}</div>}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
