import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/school";
import { useSelection } from "@/lib/selection";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "과제 · 스마트 성지" },
      { name: "description", content: "우리 반 과제와 제출 기한을 한눈에 확인하세요." },
      { property: "og:title", content: "과제 · 스마트 성지" },
      { property: "og:description", content: "우리 반 과제와 제출 기한을 한눈에 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssignmentsPage,
});

export type Assignment = {
  id: string;
  subject: string;
  title: string;
  content: string;
  due_date: string | null;
  created_at: string;
};

export function useAssignments(grade?: number, classNo?: number) {
  return useQuery({
    queryKey: ["assignments", grade, classNo],
    enabled: !!grade && !!classNo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("id, subject, title, content, due_date, created_at")
        .eq("grade", grade!)
        .eq("class_no", classNo!)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Assignment[];
    },
  });
}

export function AssignmentCard({ item }: { item: Assignment }) {
  const overdue = item.due_date ? item.due_date < todayISO() : false;
  return (
    <li className="card-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
            {item.subject}
          </span>
          <p className="mt-1.5 font-semibold">{item.title}</p>
          {item.content ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.content}</p>
          ) : null}
        </div>
        {item.due_date ? (
          <span
            className={
              overdue
                ? "shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                : "shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
            }
          >
            {item.due_date} 까지
          </span>
        ) : null}
      </div>
    </li>
  );
}

function AssignmentsPage() {
  const { selection } = useSelection();
  const { data, isPending } = useAssignments(selection?.grade, selection?.classNo);

  return (
    <AppShell>
      <PageTitle
        title="과제"
        description={selection ? `${selection.grade}학년 ${selection.classNo}반 과제` : undefined}
      />
      {isPending ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((item) => (
            <AssignmentCard key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="card-surface p-6 text-center text-sm text-muted-foreground">
          등록된 과제가 없습니다.
        </div>
      )}
      <p className="mt-6 text-center text-xs text-muted-foreground">제작 : 10604 김민</p>
    </AppShell>
  );
}
