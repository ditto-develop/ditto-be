import { ChatRoom } from '../chat-room.entity';

describe('ChatRoom', () => {
    it('매칭 기반 방 생성', () => {
        const room = ChatRoom.create('room-1', 'match-req-1');
        expect(room.id).toBe('room-1');
        expect(room.matchRequestId).toBe('match-req-1');
        expect(room.createdAt).toBeInstanceOf(Date);
    });

    it('매칭 없이 방 생성', () => {
        const room = ChatRoom.create('room-2', null);
        expect(room.matchRequestId).toBeNull();
    });
});
