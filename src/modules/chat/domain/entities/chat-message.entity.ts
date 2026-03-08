import { ValidationException } from '@common/exceptions/domain.exception';

export const MESSAGE_MAX_LENGTH = 2000;

export class ChatMessage {
    constructor(
        public readonly id: string,
        public readonly roomId: string,
        public readonly senderId: string,
        public readonly content: string,
        public readonly deletedAt: Date | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static create(id: string, roomId: string, senderId: string, content: string): ChatMessage {
        if (!content || content.trim().length === 0) {
            throw new ValidationException('메시지 내용을 입력해주세요.');
        }
        if (content.length > MESSAGE_MAX_LENGTH) {
            throw new ValidationException(`메시지는 최대 ${MESSAGE_MAX_LENGTH}자까지 입력할 수 있습니다.`);
        }
        return new ChatMessage(id, roomId, senderId, content.trim(), null, new Date(), new Date());
    }

    get isDeleted(): boolean {
        return this.deletedAt !== null;
    }
}
