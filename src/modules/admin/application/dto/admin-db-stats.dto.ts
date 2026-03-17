import { ApiProperty } from '@nestjs/swagger';

export class MatchRequestStatusCountDto {
  @ApiProperty() PENDING: number;
  @ApiProperty() ACCEPTED: number;
  @ApiProperty() REJECTED: number;
  @ApiProperty() CANCELLED: number;
  @ApiProperty() EXPIRED: number;
}

export class AdminDbStatsDto {
  @ApiProperty() users: number;
  @ApiProperty() quizSets: number;
  @ApiProperty() quizzes: number;
  @ApiProperty() matchRequests: number;
  @ApiProperty() chatRooms: number;
  @ApiProperty() ratings: number;
  @ApiProperty({ type: MatchRequestStatusCountDto })
  matchRequestsByStatus: MatchRequestStatusCountDto;
}
