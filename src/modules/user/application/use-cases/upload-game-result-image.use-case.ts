import { Inject, Injectable } from '@nestjs/common';
import { type IImageRepository, IImageRepositoryToken } from '../../ports/image.repository';
import { UploadGameResultImageCommand } from '../commands/upload-game-result-image.command';
import { Image } from '../../domain/user';

@Injectable()
export class UploadGameResultImageUseCase {
  constructor(
    @Inject(IImageRepositoryToken)
    private readonly imageRepo: IImageRepository,
  ) {}

  async execute(cmd: UploadGameResultImageCommand): Promise<void> {
    const image = Image.create(cmd.userId, cmd.round, cmd.file.url);
    await this.imageRepo.save(image);
  }
}
