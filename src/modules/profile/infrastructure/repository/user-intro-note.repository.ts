import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IUserIntroNoteRepository } from './user-intro-note.repository.interface';
import { UserIntroNote } from '@module/profile/domain/entities/user-intro-note.entity';

@Injectable()
export class UserIntroNoteRepository implements IUserIntroNoteRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string): Promise<UserIntroNote | null> {
        const row = await this.prisma.userIntroNote.findUnique({ where: { userId } });
        if (!row) return null;
        return UserIntroNote.create(row.id, row.userId, row.answers, row.createdAt, row.updatedAt);
    }

    async upsert(userId: string, answers: string[]): Promise<UserIntroNote> {
        const row = await this.prisma.userIntroNote.upsert({
            where: { userId },
            create: { userId, answers },
            update: { answers },
        });
        return UserIntroNote.create(row.id, row.userId, row.answers, row.createdAt, row.updatedAt);
    }
}
