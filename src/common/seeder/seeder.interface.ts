export const ISeederToken = 'ISeederToken';

export interface ISeeder {
  order?: number;
  seed(): Promise<void>;
}
