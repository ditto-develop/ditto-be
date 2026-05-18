export type ChatRoomStatus = 'ACTIVE' | 'ENDED';
export type ChatRoomEndedReason = 'USER_LEFT' | 'EXPIRED';

export class ChatRoom {
  constructor(
    public readonly id: string,
    public readonly matchRequestId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly expiresAt: Date | null = null,
    public readonly status: ChatRoomStatus = 'ACTIVE',
    public readonly endedAt: Date | null = null,
    public readonly endedByUserId: string | null = null,
    public readonly endedReason: ChatRoomEndedReason | null = null,
  ) {}

  static create(id: string, matchRequestId: string | null): ChatRoom {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    return new ChatRoom(id, matchRequestId, now, now, expiresAt);
  }

  get isEnded(): boolean {
    return this.status === 'ENDED' || (this.expiresAt !== null && this.expiresAt <= new Date());
  }

  get effectiveStatus(): 'ACTIVE' | 'ENDED' {
    return this.isEnded ? 'ENDED' : 'ACTIVE';
  }

  get canSendMessage(): boolean {
    return !this.isEnded;
  }

  get effectiveEndedAt(): Date | null {
    if (this.endedAt) return this.endedAt;
    if (this.expiresAt !== null && this.expiresAt <= new Date()) return this.expiresAt;
    return null;
  }

  endedReasonFor(userId: string): 'PARTNER_LEFT' | 'SELF_LEFT' | 'EXPIRED' | null {
    if (this.endedReason === 'EXPIRED' || (this.expiresAt !== null && this.expiresAt <= new Date())) {
      return 'EXPIRED';
    }
    if (!this.isEnded || !this.endedByUserId) return null;
    return this.endedByUserId === userId ? 'SELF_LEFT' : 'PARTNER_LEFT';
  }
}
