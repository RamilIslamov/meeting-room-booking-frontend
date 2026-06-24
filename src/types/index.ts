export type Role = 'USER' | 'ADMIN';

export interface AuthResponse {
  token: string;
  tokenType: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthUser {
  email: string;
  fullName: string;
  role: Role;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string | null;
  description: string | null;
  active: boolean;
}

export interface RoomRequest {
  name: string;
  capacity: number;
  location?: string;
  description?: string;
}

export type BookingStatus = 'ACTIVE' | 'CANCELLED';

export interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  userId: number;
  userEmail: string;
  title: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt: string | null;
}

export interface BookingRequest {
  roomId: number;
  title: string;
  startTime: string;
  endTime: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
