import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { getMeal } from "@/lib/meal.functions";
import { currentWeekday, formatKoreanDate, todayISO, WEEKDAYS } from "@/lib/school";
import { useSelection } from "@/lib/selection";
import { useTimetable } from "./timetable";
import { useAssignments } from "./assignments";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "홈 · 스마트 성지" },
      { name: "description", content: "오늘의 급식, 시간표, 일정, 과제, 공지를 한 화면에서 확인하세요." },
      { property: "og:title", content: "홈 · 스마트 성지" },
      {
        property: "og:description",
        content: "오늘의 급식, 시간표, 일정, 과제, 공지를 한 화면에서 확인하세요.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function Card({
  title,
  to,
  children,
}: {
  title: string;
  to: "/meal" | "/timetable" | "/assignments" | "/notices" | "/calendar";
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">{title}</h2>
        <Link to={to} className="text-xs font-bold text-muted-foreground hover:text-primary">
          더보기 ›
        </Link>
      </div>
      <div className="text-[15px] font-medium leading-relaxed">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const { selection } = useSelection();
  const today = todayISO();
  const weekday = currentWeekday();
  const mealFn = useServerFn(getMeal);

  const meal = useQuery({
    queryKey: ["meal", today],
    queryFn: () => mealFn({ data: { date: today } }),
  });
  const timetable = useTimetable(selection?.grade, selection?.classNo);
  const assignments = useAssignments(selection?.grade, selection?.classNo);

  const events = useQuery({
    queryKey: ["events", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_events")
        .select("id, title, category, event_date")
        .eq("event_date", today);
      if (error) throw error;
      return data ?? [];
    },
  });

  const notices = useQuery({
    queryKey: ["notices", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("id, title, is_important, created_at")
        .order("is_important", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const todayPeriods = (timetable.data ?? [])
    .filter((e) => e.weekday === weekday)
    .sort((a, b) => a.period - b.period);

  const upcoming = (assignments.data ?? []).filter((a) => !a.due_date || a.due_date >= today).slice(0, 3);

  return (
    <AppShell>
      <PageTitle
        title={`오늘 ${formatKoreanDate(today)}`}
        description={
          selection ? `${selection.grade}학년 ${selection.classNo}반 학교생활 요약` : undefined
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="오늘의 급식" to="/meal">
          {meal.isPending ? (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          ) : meal.data?.status === "ok" ? (
            <ul className="grid gap-1 text-sm">
              {meal.data.dishes.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {meal.data?.status === "error" ? meal.data.message : "오늘은 급식이 없습니다."}
            </p>
          )}
        </Card>

        <Card title="오늘의 시간표" to="/timetable">
          {weekday === 0 ? (
            <p className="text-sm text-muted-foreground">주말에는 수업이 없습니다.</p>
          ) : todayPeriods.length > 0 ? (
            <ul className="grid gap-1 text-sm">
              {todayPeriods.map((e) => (
                <li key={e.id}>
                  <span className="mr-2 text-xs font-semibold text-primary">{e.period}교시</span>
                  {e.subject}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {WEEKDAYS.find((d) => d.value === weekday)?.label} 시간표가 아직 등록되지 않았습니다.
            </p>
          )}
        </Card>

        <Card title="오늘의 일정" to="/calendar">
          {events.data && events.data.length > 0 ? (
            <ul className="grid gap-1 text-sm">
              {events.data.map((e) => (
                <li key={e.id}>· {e.title}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">오늘 등록된 일정이 없습니다.</p>
          )}
        </Card>

        <Card title="과제" to="/assignments">
          {upcoming.length > 0 ? (
            <ul className="grid gap-1 text-sm">
              {upcoming.map((a) => (
                <li key={a.id}>
                  · {a.title}
                  {a.due_date ? (
                    <span className="ml-2 text-xs text-muted-foreground">{a.due_date} 까지</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">예정된 과제가 없습니다.</p>
          )}
        </Card>

        <Card title="공지사항" to="/notices">
          {notices.data && notices.data.length > 0 ? (
            <ul className="grid gap-1 text-sm">
              {notices.data.map((n) => (
                <li key={n.id}>
                  {n.is_important ? <span className="mr-1 text-primary">[중요]</span> : null}
                  {n.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">등록된 공지가 없습니다.</p>
          )}
        </Card>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">제작 : 10604 김민</p>
    </AppShell>
  );
}
