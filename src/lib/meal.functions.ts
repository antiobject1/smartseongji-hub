import { createServerFn } from "@tanstack/react-start";
import { cleanDishes, MEAL_ERROR_MESSAGE, type MealResult } from "./meal-utils";

export const getMeal = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data?.date ?? "")) {
      throw new Error("invalid date");
    }
    return { date: data.date };
  })
  .handler(async ({ data }): Promise<MealResult> => {
    const key = process.env["NEIS_API_KEY"];
    const ymd = data.date.replace(/-/g, "");
    const errorResult: MealResult = {
      status: "error",
      date: data.date,
      dishes: [],
      message: MEAL_ERROR_MESSAGE,
    };

    if (!key) return errorResult;

    try {
      let officeCode = process.env["NEIS_ATPT_CODE"];
      let schoolCode = process.env["NEIS_SCHOOL_CODE"];

      if (!officeCode || !schoolCode) {
        const infoUrl = `https://open.neis.go.kr/hub/schoolInfo?KEY=${key}&Type=json&pIndex=1&pSize=10&SCHUL_NM=${encodeURIComponent("성지중학교")}`;
        const infoRes = await fetch(infoUrl);
        const infoJson = (await infoRes.json()) as Record<string, unknown>;
        const infoBlocks = infoJson["schoolInfo"] as Array<Record<string, unknown>> | undefined;
        const school = (infoBlocks?.[1]?.["row"] as Array<Record<string, string>> | undefined)?.[0];
        if (!school) return errorResult;
        officeCode = school["ATPT_OFCDC_SC_CODE"];
        schoolCode = school["SD_SCHUL_CODE"];
      }

      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${key}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${ymd}&MMEAL_SC_CODE=2`;
      const res = await fetch(url);
      const json = (await res.json()) as Record<string, unknown>;
      const blocks = json["mealServiceDietInfo"] as Array<Record<string, unknown>> | undefined;
      const rows = blocks?.[1]?.["row"] as Array<Record<string, string>> | undefined;

      if (!rows || rows.length === 0) {
        return { status: "none", date: data.date, dishes: [] };
      }

      const row = rows[0]!;
      return {
        status: "ok",
        date: data.date,
        dishes: cleanDishes(row["DDISH_NM"] ?? ""),
        calorie: row["CAL_INFO"],
        nutrition: row["NTR_INFO"]?.replace(/<br\s*\/?>/gi, " · "),
        origin: row["ORPLC_INFO"]?.replace(/<br\s*\/?>/gi, " · "),
      };
    } catch {
      return errorResult;
    }
  });
