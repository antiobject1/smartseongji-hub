import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSelection } from "@/lib/selection";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "공지사항 · 스마트 성지" },
      { name: "description", content: "성지중학교 공지사항을 확인하세요. 중요 공지는 상단에 고정됩니다." },
      { property: "og:title", content: "공지사항 · 스마트 성지" },
      {
        property: "og:description",
        content: "성지중학교 공지사항을 확인하세요. 중요 공지는 상단에 고정됩니다.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NoticesPage,
});

function NoticesPage() {
  const { selection } = useSelection();
  const { data, isPending } = useQuery({
    queryKey: ["notices", selection?.grade],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("id, title, content, is_important, target_grade, created_at")
        .order("is_important", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const list = (data ?? []).filter(
    (n) => n.target_grade === null || !selection || n.target_grade === selection.grade,
  );

  return (
    <AppShell>
      <PageTitle title="공지사항" description="중요 공지는 상단에 고정됩니다." />
      {isPending ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : list.length > 0 ? (
        <ul className="space-y-3">
          {list.map((n) => (
            <li key={n.id} className="card-surface p-4">
              <div className="flex items-center gap-2">
                {n.is_important ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    중요
                  </span>
                ) : null}
                {n.target_grade ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                    {n.target_grade}학년
                  </span>
                ) : null}
                <span className="ml-auto text-xs text-muted-foreground">
                  {n.created_at.slice(0, 10)}
                </span>
              </div>
              <p className="mt-2 font-semibold">{n.title}</p>
              {n.content ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{n.content}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="card-surface p-6 text-center text-sm text-muted-foreground">
          등록된 공지가 없습니다.
        </div>
      )}
    </AppShell>
  );
}
