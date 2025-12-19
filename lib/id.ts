import { Uuid } from "./uuid";

export class IdGenerator {
  public static newId(): string {
    return Uuid.v4();
  }
}
