import { UserRating } from '@module/rating/domain/entities/user-rating.entity';

export interface IRatingRepository {
    create(rating: UserRating): Promise<UserRating>;
    findById(id: string): Promise<UserRating | null>;
    findByMatchRequestAndUser(matchRequestId: string, fromUserId: string): Promise<UserRating | null>;
    findByTargetUser(toUserId: string): Promise<UserRating[]>;
    countByTargetUser(toUserId: string): Promise<number>;
}

export const RATING_REPOSITORY_TOKEN = Symbol('IRatingRepository');
