import { v4 as uuidv4 } from "uuid";

export class Uuid {
  public static v4(): string {
    return uuidv4();
  }
}
