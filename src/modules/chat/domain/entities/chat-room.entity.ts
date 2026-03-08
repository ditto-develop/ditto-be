export class ChatRoom {
    constructor(
        public readonly id: string,
        public readonly matchRequestId: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static create(id: string, matchRequestId: string | null): ChatRoom {
        return new ChatRoom(id, matchRequestId, new Date(), new Date());
    }
}
