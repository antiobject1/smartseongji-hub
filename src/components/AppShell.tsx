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
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-[17px] font-bold leading-tight">스마트 성지</p>
            <p className="truncate text-xs text-muted-foreground">
              {SCHOOL_NAME} · {selection.grade}학년 {selection.classNo}반
            </p>
          </div>
          <Link
            to="/"
            search={{ change: true }}
            className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Repeat className="size-3.5" />
            학년/반 변경
          </Link>
        </div>
        <nav className="mx-auto hidden max-w-5xl gap-1 px-4 pb-2.5 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-xl px-3.5 py-2 text-sm font-bold transition-colors",
                pathname === item.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_0_var(--color-border)] md:hidden">
        <div className="grid grid-cols-7">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "pressable flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-[22px]", active && "stroke-[2.4]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string | undefined;
}) {
  return (
    <div className="mb-5 mt-1">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em]">{title}</h1>
      {description ? (
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
