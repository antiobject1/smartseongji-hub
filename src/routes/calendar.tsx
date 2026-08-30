import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel, todayISO } from "@/lib/school";
import { useSelection } from "@/lib/selection";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "학사일정 · 스마트 성지" },
      { name: "description", content: "시험, 행사, 휴업일 등 성지중학교 학사일정을 확인하세요." },
      { property: "og:title", content: "학사일정 · 스마트 성지" },
      {
        property: "og:description",
        content: "시험, 행사, 휴업일 등 성지중학교 학사일정을 확인하세요.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { selection } = useSelection();
  const today = todayISO();

  const { data, isPending } = useQuery({
    queryKey: ["academic_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_events")
        .select("id, title, description, category, event_date, target_grade")
        .gte("event_date", today)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const list = (data ?? []).filter(
    (e) => e.target_grade === null || !selection || e.target_grade === selection.grade,
  );

  return (
    <AppShell>
      <PageTitle title="학사일정" description="다가오는 학교 일정을 날짜순으로 보여줍니다." />
      {isPending ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : list.length > 0 ? (
        <ul className="space-y-3">
          {list.map((e) => (
            <li key={e.id} className="card-surface flex gap-3 p-4">
              <div className="w-20 shrink-0 text-sm font-bold text-primary">{e.event_date}</div>
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  {categoryLabel(e.category)}
                </span>
                <p className="mt-1 font-semibold">{e.title}</p>
                {e.description ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {e.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card-surface p-6 text-center text-sm text-muted-foreground">
          예정된 학사일정이 없습니다.
        </div>
      )}
    </AppShell>
  );
}
