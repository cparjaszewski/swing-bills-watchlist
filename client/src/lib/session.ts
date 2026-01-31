import { nanoid } from 'nanoid';

const SESSION_KEY = 'swingvote_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'default';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = nanoid();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}
