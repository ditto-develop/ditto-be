/**
 * 강제 적용 패스워드 검증 유틸리티
 */
export function validateForcePassword(password: string | undefined): boolean {
  if (!password) {
    return false;
  }

  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const expectedPassword = `^ottid%${month}`;

  return password === expectedPassword;
}
