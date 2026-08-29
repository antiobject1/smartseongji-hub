export type MealResult = {
  status: "ok" | "none" | "error";
  date: string;
  dishes: string[];
  calorie?: string;
  nutrition?: string;
  origin?: string;
  message?: string;
};

export const MEAL_ERROR_MESSAGE = "급식 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";

export function cleanDishes(raw: string): string[] {
  return raw
    .split(/<br\s*\/?>/i)
    .map((line) =>
      line
        .replace(/\([^)]*\)/g, "")
        .replace(/[0-9.]+$/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}
