import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, ChevronLeft } from "lucide-react";
import { classesForGrade, GRADES, SCHOOL_NAME } from "@/lib/school";
import { readSelection, writeSelection } from "@/lib/selection";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { change?: true } =>
    search["change"] === true || search["change"] === "true" ? { change: true } : {},
  head: () => ({
    meta: [
      { title: "스마트 성지 · 성지중학교 학교생활 정보" },
      {
        name: "description",
        content:
          "로그인 없이 학년과 반만 선택하면 성지중학교 급식, 시간표, 과제, 공지사항, 학사일정을 바로 확인할 수 있습니다.",
      },
      { property: "og:title", content: "스마트 성지 · 성지중학교 학교생활 정보" },
      {
        property: "og:description",
        content: "학년과 반만 선택하면 급식·시간표·과제·공지를 바로 확인하는 성지중학교 정보 사이트",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelectPage,
});

function SelectPage() {
  const { change } = Route.useSearch();
  const navigate = useNavigate();
  const [grade, setGrade] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!change) {
      const saved = readSelection();
      if (saved) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
    }
    setChecked(true);
  }, [change, navigate]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  const pick = (classNo: number) => {
    if (!grade) return;
    writeSelection({ grade, classNo });
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-card">
      <div className="mx-auto max-w-md px-6 pb-16 pt-16">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
          <GraduationCap className="size-4" />
          {SCHOOL_NAME}
        </div>
        <h1 className="text-[34px] font-extrabold leading-[1.2] tracking-[-0.04em]">
          학교생활 정보를
          <br />
          가장 빠르게, <span className="text-primary">스마트 성지</span>
        </h1>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-muted-foreground">
          로그인 없이 학년과 반만 선택하면
          <br />
          급식 · 시간표 · 과제 · 공지를 바로 볼 수 있어요.
        </p>

        <div className="mt-10">
          {!grade ? (
            <>
              <h2 className="text-lg font-bold">학년을 선택해주세요</h2>
              <div className="mt-4 grid gap-3">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className="pressable flex items-center justify-between rounded-2xl bg-secondary px-5 py-5 text-left text-[19px] font-bold hover:bg-accent hover:text-accent-foreground"
                  >
                    {g}학년
                    <span className="text-xs font-semibold text-muted-foreground">
                      {classesForGrade(g).length}개 반
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setGrade(null)}
                className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" />
                학년 다시 선택
              </button>
              <h2 className="text-lg font-bold">{grade}학년 · 반을 선택해주세요</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {classesForGrade(grade).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => pick(c)}
                    className="pressable rounded-2xl bg-secondary py-5 text-[17px] font-bold hover:bg-primary hover:text-primary-foreground"
                  >
                    {c}반
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs font-medium text-muted-foreground">
          선택한 학년/반은 이 기기에 저장되며 언제든 변경할 수 있어요.
        </p>
      </div>
    </div>
  );
}
