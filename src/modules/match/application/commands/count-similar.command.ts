import { Binary } from '../../../../common/types/common.type';

export class CountSimilarCommand {
  constructor(
    readonly gameResult: Binary,
    readonly thresholdPercent: number,
    readonly round: number,
  ) {}
}
