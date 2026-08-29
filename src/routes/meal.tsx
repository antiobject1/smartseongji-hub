import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { getMeal } from "@/lib/meal.functions";
import { formatKoreanDate, todayISO } from "@/lib/school";

export const Route = createFileRoute("/meal")({
  head: () => ({
    meta: [
      { title: "오늘의 급식 · 스마트 성지" },
      { name: "description", content: "성지중학교 급식 식단을 날짜별로 확인하세요." },
      { property: "og:title", content: "오늘의 급식 · 스마트 성지" },
      { property: "og:description", content: "성지중학교 급식 식단을 날짜별로 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MealPage,
});

function shiftDate(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export function MealCard({ date }: { date: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["meal", date],
    queryFn: () => getMeal({ data: { date } }),
  });

  return (
    <div className="card-surface p-5">
      <p className="text-sm font-bold">🍚 {formatKoreanDate(date)} 중식</p>
      {isPending ? (
        <p className="mt-3 text-sm text-muted-foreground">급식 정보를 불러오는 중...</p>
      ) : data?.status === "ok" ? (
        <>
          <ul className="mt-3 space-y-1.5">
            {data.dishes.map((dish) => (
              <li key={dish} className="text-sm">
                • {dish}
              </li>
            ))}
          </ul>
          {data.calorie ? (
            <p className="mt-3 text-xs text-muted-foreground">{data.calorie}</p>
          ) : null}
          {data.origin ? (
            <details className="mt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium">원산지 정보</summary>
              <p className="mt-2 leading-relaxed">{data.origin}</p>
            </details>
          ) : null}
        </>
      ) : data?.status === "none" ? (
        <p className="mt-3 text-sm text-muted-foreground">등록된 급식 정보가 없습니다.</p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          급식 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}
    </div>
  );
}

function MealPage() {
  const [date, setDate] = useState(() => todayISO());

  return (
    <AppShell>
      <PageTitle title="급식" description="나이스(NEIS)에서 자동으로 불러온 성지중학교 식단입니다." />
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setDate((d) => shiftDate(d, -1))}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium shadow-soft"
        >
          <ChevronLeft className="size-4" />
          이전날
        </button>
        <span className="text-sm font-semibold">{date}</span>
        <button
          type="button"
          onClick={() => setDate((d) => shiftDate(d, 1))}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium shadow-soft"
        >
          다음날
          <ChevronRight className="size-4" />
        </button>
      </div>
      <MealCard date={date} />
    </AppShell>
  );
}
