export class ChatRoom {
    constructor(
        public readonly id: string,
        public readonly matchRequestId: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly expiresAt: Date | null = null,
    ) { }

    static create(id: string, matchRequestId: string | null): ChatRoom {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);
        return new ChatRoom(id, matchRequestId, now, now, expiresAt);
    }
}
