import { NanoId } from '../../../common/value-objects/nanoid.vo';
import { isInteger, isString } from '../../../common/typeguards/common.type-guard';
import { Optional } from '../../../common/types/common.type';
import { GameDto, GameOptionDto } from '../presentation/dto/game.dto';

export class GameOption {
  id: NanoId;
  index: number;
  label: string;

  private constructor(id: NanoId, index: number, label: string) {
    if (!isInteger(index) || (index !== 0 && index !== 1)) {
      throw new Error('GameOption.index must be 0 or 1');
    }
    if (!label || !isString(label) || label.trim().length === 0) {
      throw new Error('Gameoption.label must be non-empty string');
    }

    this.id = id;
    this.index = index;
    this.label = label;
    Object.freeze(this);
  }

  public static create(payload: Optional<GameOptionDto, 'id'>) {
    const id = payload.id ? NanoId.from(payload.id) : NanoId.create();
    return new GameOption(id, payload.index, payload.label);
  }

  public toPlain(): GameOptionDto {
    return {
      id: this.id.toString(),
      index: this.index,
      label: this.label,
    };
  }
}

export class Game {
  readonly id: NanoId;
  readonly text: string;
  readonly options: ReadonlyArray<GameOption>;
  readonly round: number;

  private constructor(id: NanoId, text: string, options: GameOption[], round: number) {
    if (!text || text.trim().length === 0) {
      throw new Error('Game.text must be a non-empty string');
    }
    if (!Array.isArray(options) || options.length !== 2) {
      throw new Error('Game must have exactly 2 options');
    }
    // 옵션 인덱스 중복/누락 체크 (0,1 둘 다 있어야 함)
    const indexes = new Set(options.map((o) => o.index));
    if (!indexes.has(0) || !indexes.has(1)) {
      throw new Error('Game options must include both index 0 and 1');
    }
    if (!Number.isInteger(round) || round < 0) {
      throw new Error('Game.round must be a non-negative integer');
    }

    this.id = id;
    this.text = text.trim();
    this.options = options;
    this.round = round;
    Object.freeze(this);
  }

  public static create(payload: Optional<GameDto, 'id'>): Game {
    const id = payload.id ? NanoId.from(payload.id) : NanoId.create();
    const opts = payload.options.map((o) => GameOption.create({ id: o.id, index: o.index, label: o.label }));
    return new Game(id, payload.text, opts, payload.round);
  }

  public toPlain(): GameDto {
    return {
      id: this.id.toString(),
      text: this.text,
      options: this.options.map((o) => o.toPlain()),
      round: this.round,
    };
  }
}
