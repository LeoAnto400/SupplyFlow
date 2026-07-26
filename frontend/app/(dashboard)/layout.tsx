"use client";

import { useEffect } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket/client";
import { useSocketStore } from "@/store/socket-store";

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
  const setConnected = useSocketStore((state) => state.setConnected);

  useEffect(() => {
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
  }, [setConnected]);

  return (
    <div className="flex flex-1">
      <aside className="w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground">
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
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
