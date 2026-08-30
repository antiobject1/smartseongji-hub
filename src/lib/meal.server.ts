import { cleanDishes, MEAL_ERROR_MESSAGE, type MealResult } from "./meal-utils";

function errorFor(date: string): MealResult {
  return { status: "error", date, dishes: [], message: MEAL_ERROR_MESSAGE };
}

function toISO(ymd: string) {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

async function resolveSchool(key: string) {
  let officeCode = process.env["NEIS_ATPT_CODE"];
  let schoolCode = process.env["NEIS_SCHOOL_CODE"];
  if (officeCode && schoolCode) return { officeCode, schoolCode };

  const infoUrl = `https://open.neis.go.kr/hub/schoolInfo?KEY=${key}&Type=json&pIndex=1&pSize=10&SCHUL_NM=${encodeURIComponent("성지중학교")}`;
  const infoRes = await fetch(infoUrl);
  const infoJson = (await infoRes.json()) as Record<string, unknown>;
  const infoBlocks = infoJson["schoolInfo"] as Array<Record<string, unknown>> | undefined;
  const school = (infoBlocks?.[1]?.["row"] as Array<Record<string, string>> | undefined)?.[0];
  if (!school) return null;
  officeCode = school["ATPT_OFCDC_SC_CODE"];
  schoolCode = school["SD_SCHUL_CODE"];
  if (!officeCode || !schoolCode) return null;
  return { officeCode, schoolCode };
}

function rowToResult(row: Record<string, string>, date: string): MealResult {
  const calorie = row["CAL_INFO"];
  const nutrition = row["NTR_INFO"]?.replace(/<br\s*\/?>/gi, " · ");
  const origin = row["ORPLC_INFO"]?.replace(/<br\s*\/?>/gi, " · ");
  return {
    status: "ok",
    date,
    dishes: cleanDishes(row["DDISH_NM"] ?? ""),
    ...(calorie ? { calorie } : {}),
    ...(nutrition ? { nutrition } : {}),
    ...(origin ? { origin } : {}),
  };
}

async function fetchRows(fromYmd: string, toYmd: string) {
  const key = process.env["NEIS_API_KEY"];
  if (!key) return null;
  const school = await resolveSchool(key);
  if (!school) return null;
  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${key}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${school.officeCode}&SD_SCHUL_CODE=${school.schoolCode}&MLSV_FROM_YMD=${fromYmd}&MLSV_TO_YMD=${toYmd}&MMEAL_SC_CODE=2`;
  const res = await fetch(url);
  const json = (await res.json()) as Record<string, unknown>;
  const blocks = json["mealServiceDietInfo"] as Array<Record<string, unknown>> | undefined;
  return (blocks?.[1]?.["row"] as Array<Record<string, string>> | undefined) ?? [];
}

export async function fetchMeal(date: string): Promise<MealResult> {
  try {
    const ymd = date.replace(/-/g, "");
    const rows = await fetchRows(ymd, ymd);
    if (rows === null) return errorFor(date);
    const row = rows[0];
    if (!row) return { status: "none", date, dishes: [] };
    return rowToResult(row, date);
  } catch {
    return errorFor(date);
  }
}

export async function fetchWeekMeals(dates: string[]): Promise<MealResult[]> {
  try {
    const ymds = dates.map((d) => d.replace(/-/g, "")).sort();
    const rows = await fetchRows(ymds[0]!, ymds[ymds.length - 1]!);
    if (rows === null) return dates.map(errorFor);
    const byDate = new Map<string, Record<string, string>>();
    for (const row of rows) {
      const ymd = row["MLSV_YMD"];
      if (ymd) byDate.set(toISO(ymd), row);
    }
    return dates.map((date) => {
      const row = byDate.get(date);
      return row ? rowToResult(row, date) : { status: "none", date, dishes: [] };
    });
  } catch {
    return dates.map(errorFor);
  }
}
