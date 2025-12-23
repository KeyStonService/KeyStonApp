import { Link, useLocation } from "wouter";
import { MessageSquare, Link2, ClipboardList, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", label: "Chat", icon: MessageSquare },
  { path: "/connections", label: "Connections", icon: Link2 },
  { path: "/audit", label: "Audit Log", icon: ClipboardList },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">
              ChatOps Assistant
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
