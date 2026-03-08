import { ChatMessage, MESSAGE_MAX_LENGTH } from '../chat-message.entity';
import { ValidationException } from '@common/exceptions/domain.exception';

describe('ChatMessage', () => {
    const roomId = 'room-1';
    const senderId = 'user-1';

    describe('create', () => {
        it('정상 메시지 생성', () => {
            const msg = ChatMessage.create('id-1', roomId, senderId, '안녕하세요!');
            expect(msg.id).toBe('id-1');
            expect(msg.roomId).toBe(roomId);
            expect(msg.senderId).toBe(senderId);
            expect(msg.content).toBe('안녕하세요!');
            expect(msg.deletedAt).toBeNull();
        });

        it('메시지 앞뒤 공백 제거', () => {
            const msg = ChatMessage.create('id-1', roomId, senderId, '  hello  ');
            expect(msg.content).toBe('hello');
        });

        it('빈 메시지 → ValidationException', () => {
            expect(() => ChatMessage.create('id-1', roomId, senderId, '')).toThrow(ValidationException);
        });

        it('공백만 있는 메시지 → ValidationException', () => {
            expect(() => ChatMessage.create('id-1', roomId, senderId, '   ')).toThrow(ValidationException);
        });

        it(`${MESSAGE_MAX_LENGTH}자 초과 → ValidationException`, () => {
            const longContent = 'a'.repeat(MESSAGE_MAX_LENGTH + 1);
            expect(() => ChatMessage.create('id-1', roomId, senderId, longContent)).toThrow(ValidationException);
        });

        it(`${MESSAGE_MAX_LENGTH}자 정확히 → 성공`, () => {
            const content = 'a'.repeat(MESSAGE_MAX_LENGTH);
            const msg = ChatMessage.create('id-1', roomId, senderId, content);
            expect(msg.content.length).toBe(MESSAGE_MAX_LENGTH);
        });
    });

    describe('isDeleted', () => {
        it('deletedAt이 null이면 false', () => {
            const msg = ChatMessage.create('id-1', roomId, senderId, 'test');
            expect(msg.isDeleted).toBe(false);
        });

        it('deletedAt이 설정되면 true', () => {
            const msg = new ChatMessage('id-1', roomId, senderId, 'test', new Date(), new Date(), new Date());
            expect(msg.isDeleted).toBe(true);
        });
    });
});
