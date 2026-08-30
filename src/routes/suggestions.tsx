import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/suggestions")({
  head: () => ({
    meta: [
      { title: "건의함 · 스마트 성지" },
      { name: "description", content: "로그인 없이 학교에 건의사항을 익명으로 보낼 수 있습니다." },
      { property: "og:title", content: "건의함 · 스마트 성지" },
      {
        property: "og:description",
        content: "로그인 없이 학교에 건의사항을 익명으로 보낼 수 있습니다.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuggestionsPage,
});

function SuggestionsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setState("sending");
    const { error } = await supabase.from("suggestions").insert({
      title: title.trim(),
      content: content.trim(),
      author_name: anonymous || !author.trim() ? "익명" : author.trim(),
    });
    if (error) {
      setState("error");
      return;
    }
    setTitle("");
    setContent("");
    setAuthor("");
    setState("done");
  };

  return (
    <AppShell>
      <PageTitle title="건의함" description="학교에 바라는 점을 자유롭게 남겨주세요." />
      <form onSubmit={submit} className="card-surface grid gap-4 p-5">
        <label className="grid gap-1 text-sm font-semibold">
          제목
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            className="rounded-2xl bg-secondary px-4 py-3.5 text-[15px] font-medium outline-none ring-primary transition focus:bg-card focus:ring-2"
            placeholder="건의 제목"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          내용
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            maxLength={2000}
            className="rounded-2xl bg-secondary px-4 py-3.5 text-[15px] font-medium outline-none ring-primary transition focus:bg-card focus:ring-2"
            placeholder="자세한 내용을 적어주세요"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="size-4 accent-[hsl(var(--primary))]"
          />
          익명으로 작성
        </label>
        {!anonymous ? (
          <label className="grid gap-1 text-sm font-semibold">
            작성자
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={30}
              className="rounded-2xl bg-secondary px-4 py-3.5 text-[15px] font-medium outline-none ring-primary transition focus:bg-card focus:ring-2"
              placeholder="예: 1학년 3반 김성지"
            />
          </label>
        ) : null}
        <button
          type="submit"
          disabled={state === "sending"}
          className="pressable rounded-2xl bg-primary px-4 py-4 text-[16px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {state === "sending" ? "보내는 중..." : "건의하기"}
        </button>
        {state === "done" ? (
          <p className="text-sm font-semibold text-primary">건의가 접수되었습니다. 감사합니다!</p>
        ) : null}
        {state === "error" ? (
          <p className="text-sm font-semibold text-destructive">
            전송에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : null}
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        접수된 건의는 관리자만 확인할 수 있으며 대기중 · 처리중 · 완료 상태로 관리됩니다.
      </p>
    </AppShell>
  );
}
