/**
 * 로그인 입력값을 분석하여, 이메일 또는 아이디 기반의 로그인 요청 객체를 생성.
 * 
 * @param loginInput - 사용자가 입력한 로그인 식별자(이메일 또는 아이디).
 *                     '@'가 포함되어 있으면 이메일로 간주, 그렇지 않으면 아이디로 간주
 * @param password - 로그인 비밀번호
 * @returns LoginRequest 객체 형식으로 이메일 또는 아이디 중 하나와 비밀번호를 포함한 객체를 반환
 */

export const buildLoginCredentials = (
  loginInput: string,
  password: string
) => {
  const isEmail = loginInput.includes('@')
  return {
    email: isEmail ? loginInput : undefined,
    userId: isEmail ? undefined : loginInput,
    password,
  }
}
