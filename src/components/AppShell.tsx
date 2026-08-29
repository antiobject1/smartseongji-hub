import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  CalendarDays,
  ClipboardList,
  Home,
  Megaphone,
  MessageSquarePlus,
  Table2,
  UtensilsCrossed,
  Repeat,
} from "lucide-react";
import { SCHOOL_NAME } from "@/lib/school";
import { useSelection } from "@/lib/selection";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "홈", icon: Home },
  { to: "/meal", label: "급식", icon: UtensilsCrossed },
  { to: "/timetable", label: "시간표", icon: Table2 },
  { to: "/assignments", label: "과제", icon: ClipboardList },
  { to: "/notices", label: "공지", icon: Megaphone },
  { to: "/calendar", label: "학사일정", icon: CalendarDays },
  { to: "/suggestions", label: "건의함", icon: MessageSquarePlus },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { selection, loaded } = useSelection();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loaded && !selection) {
      navigate({ to: "/" });
    }
  }, [loaded, selection, navigate]);

  if (!loaded || !selection) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="hero-gradient sticky top-0 z-30 text-primary-foreground shadow-soft">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight">스마트 성지</p>
            <p className="truncate text-xs opacity-90">
              {SCHOOL_NAME} · {selection.grade}학년 {selection.classNo}반
            </p>
          </div>
          <Link
            to="/"
            search={{ change: true }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/25"
          >
            <Repeat className="size-3.5" />
            학년/반 변경
          </Link>
        </div>
        <nav className="mx-auto hidden max-w-5xl gap-1 px-2 pb-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.to ? "bg-white/25" : "hover:bg-white/15",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-7">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
