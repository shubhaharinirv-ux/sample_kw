"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type UpdatableValue = string | null | undefined;

/**
 * Shared URL query state helper.
 *
 * - Uses consistent query param names across the app (see per-page notes where used).
 * - Deletes keys when value is undefined/null/"" so links stay clean.
 * - Always uses replace=true to avoid polluting history while tweaking filters.
 */
export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const entries: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      entries[key] = value;
    });
    return entries;
  }, [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, UpdatableValue>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        });

        // Avoid redundant router updates that can trigger render loops.
        if (next.toString() === prev.toString()) {
          return prev;
        }

        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setParam = useCallback(
    (key: string, value: UpdatableValue) => setParams({ [key]: value }),
    [setParams]
  );

  return {
    params,
    setParam,
    setParams,
  };
}

export const csvFromArray = (values: Array<string | number>) =>
  values.length > 0 ? values.join(",") : undefined;

export const csvToArray = (value?: string | null) =>
  value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];
