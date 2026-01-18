/**
 * 매칭 성사 알림 서비스 인터페이스
 * 매칭이 성사되었을 때 사용자에게 알림을 보내는 기능을 정의합니다.
 */
export interface IMatchingNotificationService {
  /**
   * 매칭 성사 알림을 보냅니다.
   * @param userId 매칭된 사용자 ID
   * @param matchedUserId 상대방 사용자 ID
   * @param quizSetId 퀴즈 세트 ID
   */
  notifyMatchingSuccess(
    userId: string,
    matchedUserId: string,
    quizSetId: string,
  ): Promise<void>;
}

export const MATCHING_NOTIFICATION_SERVICE_TOKEN = Symbol('IMatchingNotificationService');