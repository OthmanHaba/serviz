import api from '../axios';

export interface SupportSession {
  id: number;
  status: 'open' | 'close';
  messageCount: number;
  createdAt: string;
  lastMessageAt: string;
  subject: string;
}

/**
 * Get all support sessions for the current user
 */
export const getSupportSessions = async () => {
  return await api.get('/support/sessions');
};

/**
 * Get details for a specific support session
 */
export const getSupportSessionDetails = async (sessionId: number) => {
  return await api.get(`/support/sessions/${sessionId}`);
};

/**
 * Create a new support session
 */
export const createSupportSession = async (subject: string) => {
  return await api.post('/support/sessions', { subject });
};

/**
 * Send a message to a support session
 */
export const sendSupportMessage = async (sessionId: number, message: string) => {
  return await api.post(`/support/sessions/${sessionId}/messages`, { message });
};

/**
 * Close a support session
 */
export const closeSupportSession = async (sessionId: number) => {
  return await api.post(`/support/sessions/${sessionId}/close`);
}; 

