export class DateTime {
  public static toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  public static toHHMMSS(d: Date): string {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  public static secondsBetween(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }

  public static fromDateAndHHMM(dateISO: string, timeHHMM: string): Date {
    return new Date(`${dateISO}T${timeHHMM}:00`);
  }
}
