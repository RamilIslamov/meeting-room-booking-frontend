import { api } from './client';
import type { Room, RoomRequest } from '../types';

export function listRooms(): Promise<Room[]> {
  return api.get<Room[]>('/rooms').then((r) => r.data);
}

export function getRoom(id: number): Promise<Room> {
  return api.get<Room>(`/rooms/${id}`).then((r) => r.data);
}

export function createRoom(body: RoomRequest): Promise<Room> {
  return api.post<Room>('/rooms', body).then((r) => r.data);
}

export function updateRoom(id: number, body: RoomRequest): Promise<Room> {
  return api.put<Room>(`/rooms/${id}`, body).then((r) => r.data);
}

export function deleteRoom(id: number): Promise<void> {
  return api.delete(`/rooms/${id}`).then(() => undefined);
}
