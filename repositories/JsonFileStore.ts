import { promises as fs } from "fs";
import path from "path";

export class JsonFileStore<T> {
  private readonly filePath: string;

  constructor(relativePath: string) {
    this.filePath = path.join(process.cwd(), relativePath);
  }

  public async readAll(): Promise<T[]> {
    const raw = await fs.readFile(this.filePath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as T[];
  }

  public async writeAll(items: T[]): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    const tmpPath = `${this.filePath}.tmp`;
    const json = JSON.stringify(items, null, 2);
    await fs.writeFile(tmpPath, json, "utf-8");
    await fs.rename(tmpPath, this.filePath);
  }
}
