const sessionKey = "brasiltec_session_token";

export function getSessionToken(): string | null {
  return window.sessionStorage.getItem(sessionKey);
}

export function setSessionToken(token: string): void {
  window.sessionStorage.setItem(sessionKey, token);
}

export function clearSessionToken(): void {
  window.sessionStorage.removeItem(sessionKey);
}
