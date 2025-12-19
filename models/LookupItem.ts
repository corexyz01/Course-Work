import { ValidationError } from "./errors";

export type LookupItemDTO = {
  id: string;
  name: string;
};

export class LookupItem {
  public readonly id: string;
  public readonly name: string;

  private constructor(dto: LookupItemDTO) {
    this.id = dto.id;
    this.name = dto.name;
  }

  public static fromDTO(dto: LookupItemDTO): LookupItem {
    LookupItem.assertName(dto.name);
    return new LookupItem({ id: dto.id, name: dto.name.trim() });
  }

  public static createNew(input: { id: string; name: string }): LookupItem {
    LookupItem.assertName(input.name);
    return new LookupItem({ id: input.id, name: input.name.trim() });
  }

  public toDTO(): LookupItemDTO {
    return { id: this.id, name: this.name };
  }

  private static assertName(name: string): void {
    if (name.trim().length < 2) throw new ValidationError("Name too short");
  }
}
