import { useCallback, useEffect, useState } from "react";
import { isValidSelection } from "./school";

const STORAGE_KEY = "smart-sungji-selection";

export type Selection = { grade: number; classNo: number };

export function readSelection(): Selection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Selection>;
    if (
      typeof parsed?.grade === "number" &&
      typeof parsed?.classNo === "number" &&
      isValidSelection(parsed.grade, parsed.classNo)
    ) {
      return { grade: parsed.grade, classNo: parsed.classNo };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeSelection(selection: Selection) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
}

export function clearSelection() {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** 브라우저에 저장된 학년/반을 읽어온다. loaded 가 true 가 된 뒤에 값이 유효하다. */
export function useSelection() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSelection(readSelection());
    setLoaded(true);
  }, []);

  const save = useCallback((next: Selection) => {
    writeSelection(next);
    setSelection(next);
  }, []);

  const reset = useCallback(() => {
    clearSelection();
    setSelection(null);
  }, []);

  return { selection, loaded, save, reset };
}
