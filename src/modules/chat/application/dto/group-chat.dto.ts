import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GroupVoteDto } from './vote.dto';

export class GroupChatMemberDto {
  @ApiProperty({ description: '유저 ID' })
  userId: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL' })
  avatarUrl: string | null;
}

export class GroupChatRoomDetailDto {
  @ApiProperty({ description: '채팅방 ID' })
  roomId: string;

  @ApiProperty({ description: '참여 멤버 목록', type: [GroupChatMemberDto] })
  members: GroupChatMemberDto[];

  @ApiProperty({ description: '총 멤버 수' })
  totalMembers: number;

  @ApiPropertyOptional({ description: '활성 투표 정보 (없으면 null)', nullable: true, type: GroupVoteDto })
  vote: GroupVoteDto | null;

  @ApiPropertyOptional({ description: '채팅방 만료 시각 (ISO8601)' })
  expiresAt: string | null;

  @ApiProperty({ description: '채팅방 종료 여부' })
  isEnded: boolean;
}

export class VoteMessageMetaDto {
  @ApiProperty({ description: '투표 ID' })
  voteId: string;

  @ApiProperty({ description: '장소 요약' })
  placeSummary: { head: string; extraCount: number };

  @ApiProperty({ description: '시간 요약' })
  timeSummary: { head: string; extraCount: number };
}

export class GroupChatMessageDto {
  @ApiProperty({ description: '메시지 ID' })
  id: string;

  @ApiProperty({ description: '메시지 타입', enum: ['CHAT', 'SYSTEM', 'VOTE_OPENED'] })
  type: 'CHAT' | 'SYSTEM' | 'VOTE_OPENED';

  @ApiPropertyOptional({ description: '발신자 ID (SYSTEM 메시지는 null)', nullable: true })
  senderId: string | null;

  @ApiProperty({ description: '발신자 닉네임 (SYSTEM 메시지는 빈 문자열)' })
  senderNickname: string;

  @ApiPropertyOptional({ description: '발신자 프로필 이미지 URL', nullable: true })
  senderAvatarUrl: string | null;

  @ApiProperty({ description: '메시지 내용' })
  content: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '읽지 않은 참여자 수 (SYSTEM 메시지는 0)' })
  unreadCount: number;

  @ApiPropertyOptional({ description: '투표 메타데이터 (VOTE_OPENED 메시지만)', nullable: true, type: VoteMessageMetaDto })
  voteMeta?: VoteMessageMetaDto;
}

export class GroupMessageListDto {
  @ApiProperty({ description: '메시지 목록', type: [GroupChatMessageDto] })
  messages: GroupChatMessageDto[];

  @ApiPropertyOptional({ description: '다음 페이지 커서 (없으면 마지막 페이지)' })
  nextCursor: string | null;
}

export class LeaveGroupChatRoomDto {
  @ApiPropertyOptional({ description: '나가기 사유' })
  @IsOptional()
  @IsString()
  reason?: string;
}
