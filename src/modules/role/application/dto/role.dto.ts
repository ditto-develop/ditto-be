export class RoleDto {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: number, name: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDomain(role: { id: number; name: string; createdAt: Date; updatedAt: Date }): RoleDto {
    return new RoleDto(role.id, role.name, role.createdAt, role.updatedAt);
  }
}
