import { api } from './client';
import type { CurrentUser, UserSummary } from '../types';

export function getCurrentUser(): Promise<CurrentUser> {
  return api.get<CurrentUser>('/users/me').then((r) => r.data);
}

export function listUsers(): Promise<UserSummary[]> {
  return api.get<UserSummary[]>('/users').then((r) => r.data);
}

export function topUp(userId: number, amount: number): Promise<UserSummary> {
  return api.post<UserSummary>(`/users/${userId}/top-up`, { amount }).then((r) => r.data);
}
