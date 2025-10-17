export const ISeederToken = Symbol('ISeederToken');

export interface ISeeder {
  order?: number;
  seed(): Promise<void>;
}
