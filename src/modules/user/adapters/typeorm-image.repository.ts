import { Image } from '../domain/user';
import { IImageRepository } from '../ports/image.repository';
import { ImageEntity } from '../../../infra/db/entities/user/image.entity';
import { NanoId } from '../../../common/value-objects/nanoid.vo';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class TypeormImageRepository implements IImageRepository {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly repo: Repository<ImageEntity>,
  ) {}

  async save(image: Image): Promise<void> {
    const entity = this.toEntity(image);

    await this.repo.save(entity);
  }

  private toEntity(domain: Image): ImageEntity {
    const entity = new ImageEntity();
    entity.id = NanoId.create().toString();
    entity.round = domain.round;
    entity.userId = domain.userId.toString();
    entity.imagePath = domain.imagePath;

    return entity;
  }
}
