import { createServerFn } from "@tanstack/react-start";
import type { MealResult } from "./meal-utils";

export const getMeal = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data?.date ?? "")) {
      throw new Error("invalid date");
    }
    return { date: data.date };
  })
  .handler(async ({ data }): Promise<MealResult> => {
    const { fetchMeal } = await import("./meal.server");
    return fetchMeal(data.date);
  });

export const getWeekMeals = createServerFn({ method: "GET" })
  .inputValidator((data: { dates: string[] }) => {
    const dates = data?.dates ?? [];
    if (
      !Array.isArray(dates) ||
      dates.length === 0 ||
      dates.length > 7 ||
      dates.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d))
    ) {
      throw new Error("invalid dates");
    }
    return { dates };
  })
  .handler(async ({ data }): Promise<MealResult[]> => {
    const { fetchWeekMeals } = await import("./meal.server");
    return fetchWeekMeals(data.dates);
  });
