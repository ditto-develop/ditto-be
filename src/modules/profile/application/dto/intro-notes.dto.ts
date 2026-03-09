import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize, ArrayMaxSize, MaxLength } from 'class-validator';
import { INTRO_NOTE_COUNT, INTRO_NOTE_MAX_LENGTH, UserIntroNote } from '@module/profile/domain/entities/user-intro-note.entity';

export class IntroNotesDto {
    @ApiProperty({
        description: `소개 노트 답변 배열 (${INTRO_NOTE_COUNT}개 고정)`,
        type: [String],
        example: ['이어폰, 선크림, 카메라', '동네 카페에서 브런치', '', '', '', '', '', '', '', ''],
    })
    answers: string[];

    @ApiProperty({ description: '작성된 답변 수 (비어있지 않은 항목)', example: 2 })
    completedCount: number;

    static fromDomain(note: UserIntroNote): IntroNotesDto {
        const dto = new IntroNotesDto();
        dto.answers = note.answers;
        dto.completedCount = note.completedCount;
        return dto;
    }

    static empty(): IntroNotesDto {
        const dto = new IntroNotesDto();
        dto.answers = Array(INTRO_NOTE_COUNT).fill('');
        dto.completedCount = 0;
        return dto;
    }
}

export class UpdateIntroNotesDto {
    @ApiProperty({
        description: `소개 노트 답변 배열 (정확히 ${INTRO_NOTE_COUNT}개, 빈 문자열 허용)`,
        type: [String],
        minItems: INTRO_NOTE_COUNT,
        maxItems: INTRO_NOTE_COUNT,
        example: ['이어폰, 선크림, 카메라', '동네 카페에서 브런치', '', '', '', '', '', '', '', ''],
    })
    @IsArray()
    @ArrayMinSize(INTRO_NOTE_COUNT, { message: `답변은 정확히 ${INTRO_NOTE_COUNT}개여야 합니다.` })
    @ArrayMaxSize(INTRO_NOTE_COUNT, { message: `답변은 정확히 ${INTRO_NOTE_COUNT}개여야 합니다.` })
    @IsString({ each: true })
    @MaxLength(INTRO_NOTE_MAX_LENGTH, { each: true, message: `각 답변은 최대 ${INTRO_NOTE_MAX_LENGTH}자까지 입력할 수 있습니다.` })
    answers: string[];
}
