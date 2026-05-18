import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum VoteStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class CreatePlaceOptionDto {
  @ApiProperty({ description: '장소 레이블', example: '홍대 앞 카페' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ description: '주소', example: '서울 마포구 양화로 160' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '지도 URL (kakao/naver 등)', example: 'https://map.kakao.com/?q=홍대' })
  @IsOptional()
  @IsString()
  mapLink?: string;

  @ApiPropertyOptional({ description: '위도', example: 37.4979502 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '경도', example: 127.0276368 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateTimeOptionDto {
  @ApiProperty({ description: '표시용 날짜 레이블', example: '4월 20일 (토)' })
  @IsString()
  @IsNotEmpty()
  dateLabel: string;

  @ApiPropertyOptional({ description: '날짜 YYYY-MM-DD', example: '2026-04-20' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: '시간 HH:mm', example: '19:00' })
  @IsOptional()
  @IsString()
  time?: string;
}

export class CreateVoteDto {
  @ApiProperty({ description: '투표 제목', example: '모임 장소/시간 투표' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '복수 선택 허용 여부', example: false })
  @IsBoolean()
  allowMultiple: boolean;

  @ApiPropertyOptional({ description: '장소 옵션 목록', type: [CreatePlaceOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlaceOptionDto)
  placeOptions?: CreatePlaceOptionDto[];

  @ApiPropertyOptional({ description: '시간 옵션 목록', type: [CreateTimeOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeOptionDto)
  timeOptions?: CreateTimeOptionDto[];
}

export class AddVoteOptionDto {
  @ApiProperty({ description: '옵션 유형', enum: ['PLACE', 'TIME'], example: 'PLACE' })
  @IsString()
  type: 'PLACE' | 'TIME';

  @ApiPropertyOptional({ description: '장소 레이블 (PLACE 타입)' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: '주소 (PLACE 타입)' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '지도 URL (PLACE 타입)' })
  @IsOptional()
  @IsString()
  mapLink?: string;

  @ApiPropertyOptional({ description: '위도 (PLACE 타입)', example: 37.4979502 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '경도 (PLACE 타입)', example: 127.0276368 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: '표시용 날짜 레이블 (TIME 타입)' })
  @IsOptional()
  @IsString()
  dateLabel?: string;

  @ApiPropertyOptional({ description: '날짜 YYYY-MM-DD (TIME 타입)' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: '시간 HH:mm (TIME 타입)' })
  @IsOptional()
  @IsString()
  time?: string;
}

export class CastVoteDto {
  @ApiProperty({ description: '선택한 장소 옵션 ID 목록', type: [String] })
  @IsArray()
  @IsString({ each: true })
  placeIds: string[];

  @ApiProperty({ description: '선택한 시간 옵션 ID 목록', type: [String] })
  @IsArray()
  @IsString({ each: true })
  timeIds: string[];
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class VotePlaceOptionDto {
  @ApiProperty({ description: '옵션 ID' })
  id: string;

  @ApiProperty({ description: '장소 레이블' })
  label: string;

  @ApiProperty({ description: '주소', nullable: true })
  address: string | null;

  @ApiPropertyOptional({ description: '지도 URL', nullable: true })
  mapLink: string | null;

  @ApiProperty({ description: '위도', nullable: true })
  latitude: number | null;

  @ApiProperty({ description: '경도', nullable: true })
  longitude: number | null;

  @ApiProperty({ description: '이 옵션에 투표한 유저 ID 목록', type: [String] })
  voterIds: string[];
}

export class VoteTimeOptionDto {
  @ApiProperty({ description: '옵션 ID' })
  id: string;

  @ApiProperty({ description: '표시용 날짜 레이블' })
  dateLabel: string;

  @ApiPropertyOptional({ description: '날짜 YYYY-MM-DD', nullable: true })
  date: string | null;

  @ApiPropertyOptional({ description: '시간 HH:mm', nullable: true })
  time: string | null;

  @ApiProperty({ description: '이 옵션에 투표한 유저 ID 목록', type: [String] })
  voterIds: string[];
}

export class MyVoteDto {
  @ApiProperty({ description: '내가 선택한 장소 옵션 ID 목록', type: [String] })
  placeIds: string[];

  @ApiProperty({ description: '내가 선택한 시간 옵션 ID 목록', type: [String] })
  timeIds: string[];
}

export class GroupVoteDto {
  @ApiProperty({ description: '투표 ID' })
  id: string;

  @ApiProperty({ description: '투표 제목' })
  title: string;

  @ApiProperty({ description: '복수 선택 허용 여부' })
  allowMultiple: boolean;

  @ApiProperty({ description: '장소 옵션 목록', type: [VotePlaceOptionDto] })
  placeOptions: VotePlaceOptionDto[];

  @ApiProperty({ description: '시간 옵션 목록', type: [VoteTimeOptionDto] })
  timeOptions: VoteTimeOptionDto[];

  @ApiProperty({ description: '채팅방 전체 멤버 수' })
  totalMembers: number;

  @ApiProperty({ description: '한 번이라도 투표한 멤버 수' })
  votedCount: number;

  @ApiPropertyOptional({ description: '내 투표 선택 (투표 안 했으면 null)', nullable: true, type: MyVoteDto })
  myVote: MyVoteDto | null;

  @ApiProperty({ description: '투표 상태', enum: VoteStatus })
  status: VoteStatus;
}

export class KakaoPlaceSearchResultDto {
  @ApiProperty({ description: '카카오 장소 ID', example: '26338954' })
  id: string;

  @ApiProperty({ description: '장소명', example: '스타벅스 강남역점' })
  name: string;

  @ApiProperty({ description: '주소', example: '서울 강남구 테헤란로 231' })
  address: string;

  @ApiProperty({ description: '카카오맵 장소 URL', example: 'https://place.map.kakao.com/26338954' })
  mapUrl: string;

  @ApiPropertyOptional({ description: '위도', example: 37.4979502 })
  latitude?: number;

  @ApiPropertyOptional({ description: '경도', example: 127.0276368 })
  longitude?: number;
}
