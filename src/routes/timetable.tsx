import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { PERIODS, WEEKDAYS, currentWeekday } from "@/lib/school";
import { useSelection } from "@/lib/selection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "시간표 · 스마트 성지" },
      { name: "description", content: "학년과 반에 맞는 주간 시간표를 확인하세요." },
      { property: "og:title", content: "시간표 · 스마트 성지" },
      { property: "og:description", content: "학년과 반에 맞는 주간 시간표를 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimetablePage,
});

export function useTimetable(grade?: number, classNo?: number) {
  return useQuery({
    queryKey: ["timetable", grade, classNo],
    enabled: !!grade && !!classNo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select("id, weekday, period, subject")
        .eq("grade", grade!)
        .eq("class_no", classNo!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function TimetablePage() {
  const { selection } = useSelection();
  const { data, isPending } = useTimetable(selection?.grade, selection?.classNo);
  const today = currentWeekday();

  const cell = (weekday: number, period: number) =>
    data?.find((e) => e.weekday === weekday && e.period === period)?.subject ?? "";

  return (
    <AppShell>
      <PageTitle
        title="시간표"
        description={
          selection ? `${selection.grade}학년 ${selection.classNo}반 주간 시간표` : undefined
        }
      />
      <div className="card-surface overflow-hidden">
        {isPending ? (
          <p className="p-5 text-sm text-muted-foreground">불러오는 중...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-center text-sm">
              <thead>
                <tr className="bg-secondary text-secondary-foreground">
                  <th className="w-14 py-2.5 text-xs font-semibold">교시</th>
                  {WEEKDAYS.map((d) => (
                    <th
                      key={d.value}
                      className={cn("py-2.5 text-xs font-semibold", d.value === today && "text-primary")}
                    >
                      {d.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p) => (
                  <tr key={p} className="border-t border-border">
                    <td className="bg-muted py-3 text-xs font-semibold text-muted-foreground">{p}</td>
                    {WEEKDAYS.map((d) => (
                      <td
                        key={d.value}
                        className={cn(
                          "px-1 py-3 text-[13px]",
                          d.value === today && "bg-accent/50 font-semibold",
                        )}
                      >
                        {cell(d.value, p) || <span className="text-muted-foreground/50">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">시간표는 관리자가 학급별로 등록합니다.</p>
    </AppShell>
  );
}
