import { DateTime } from "./datetime";

export class DateRange {
  public static listISO(fromISO: string, toISO: string): string[] {
    if (fromISO > toISO) return [];
    const out: string[] = [];
    let d = new Date(`${fromISO}T00:00:00`);
    const end = new Date(`${toISO}T00:00:00`);
    while (d.getTime() <= end.getTime()) {
      out.push(DateTime.toISODate(d));
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    }
    return out;
  }
}
