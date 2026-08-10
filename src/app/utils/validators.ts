export function isFilled(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isEmail(value: string | null | undefined): boolean {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  const digits = value.replace(/[\s().-]/g, "");
  return /^\+?\d{8,15}$/.test(digits);
}

export function isRealDate(value: string | null | undefined): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === Number(value.substring(0, 4)) &&
    d.getMonth() + 1 === Number(value.substring(5, 7)) &&
    d.getDate() === Number(value.substring(8, 10))
  );
}

export function isNotFuture(value: string | null | undefined): boolean {
  if (typeof value !== "string" || !isRealDate(value)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`).getTime() <= today.getTime();
}

export function isMoneyMin(value: number, min: number): boolean {
  return Number.isFinite(value) && value >= min;
}

export function isAcademicYear(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{4})$/.exec(value.trim());
  if (!match) return false;
  return Number(match[2]) === Number(match[1]) + 1;
}

export function isTimeRange(start: string, end: string): boolean {
  if (!start || !end) return false;
  return start < end;
}