import { Image } from '../domain/user';

export const IImageRepositoryToken = Symbol('IImageRepository');

export interface IImageRepository {
  save(image: Image): Promise<void>;
}
