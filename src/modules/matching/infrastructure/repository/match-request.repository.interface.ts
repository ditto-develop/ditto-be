import { MatchRequest, MatchRequestStatus } from '@module/matching/domain/entities/match-request.entity';

export interface IMatchRequestRepository {
    create(request: MatchRequest): Promise<MatchRequest>;
    findById(id: string): Promise<MatchRequest | null>;
    findByQuizSetAndUsers(quizSetId: string, fromUserId: string, toUserId: string): Promise<MatchRequest | null>;
    findByUserAndQuizSet(userId: string, quizSetId: string): Promise<MatchRequest[]>;
    findSentByUser(userId: string, quizSetId?: string): Promise<MatchRequest[]>;
    findReceivedByUser(userId: string, quizSetId?: string): Promise<MatchRequest[]>;
    updateStatus(id: string, status: MatchRequestStatus, respondedAt?: Date): Promise<MatchRequest>;
    hasAcceptedMatch(userId: string, quizSetId: string): Promise<boolean>;
    findAcceptedMatch(userId: string, quizSetId: string): Promise<MatchRequest | null>;
}

export const MATCH_REQUEST_REPOSITORY_TOKEN = Symbol('IMatchRequestRepository');
