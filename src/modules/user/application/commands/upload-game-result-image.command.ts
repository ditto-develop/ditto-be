import { NanoId } from '../../../../common/value-objects/nanoid.vo';
import { UploadedFileVo } from '../../../../common/value-objects/uploaded-file.vo';

export class UploadGameResultImageCommand {
  readonly userId: NanoId;
  readonly round: number;
  readonly file: UploadedFileVo;

  constructor(userId: string, round: number, file: UploadedFileVo) {
    this.userId = NanoId.from(userId);
    this.round = round;
    this.file = file;
    Object.freeze(this);
  }
}
