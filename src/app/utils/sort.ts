export type SortOrder = "asc" | "desc";

export const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const SHIFT_ORDER = ["Morning", "Afternoon", "Evening"];

function orderIndex(value: string, order: string[]): number {
  const idx = order.indexOf(value);
  return idx === -1 ? order.length : idx;
}

export function compareValues(a: unknown, b: unknown, order?: string[]): number {
  const isNumA = typeof a === "number";
  const isNumB = typeof b === "number";
  if (isNumA && isNumB) return a - b;
  if (isNumA !== isNumB) return isNumA ? -1 : 1;

  const sa = String(a ?? "");
  const sb = String(b ?? "");
  if (order) {
    return orderIndex(sa, order) - orderIndex(sb, order);
  }
  return sa.localeCompare(sb, undefined, { numeric: true });
}

export function sortRows<T>(
  rows: T[],
  getValue: (row: T) => unknown,
  order: SortOrder,
  orderList?: string[],
): T[] {
  return [...rows].sort((x, y) => {
    const cmp = compareValues(getValue(x), getValue(y), orderList);
    return order === "asc" ? cmp : -cmp;
  });
}