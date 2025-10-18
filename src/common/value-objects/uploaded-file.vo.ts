import { NanoId } from './nanoid.vo';
import { join, basename } from 'path';

export class UploadedFileVo {
  private constructor(
    public readonly id: NanoId,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly path: string,
  ) {}

  static fromMulterFile(file: Express.Multer.File): UploadedFileVo {
    const id = NanoId.create();
    const relativePath = join('/api/images', basename(file.path));
    return new UploadedFileVo(id, file.originalname, file.mimetype, file.size, relativePath);
  }

  get url() {
    return this.path;
  }
}
