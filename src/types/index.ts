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

export interface CurrentUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  balance: number;
}

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  balance: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string | null;
  floor: number | null;
  description: string | null;
  pricePerHour: number;
  active: boolean;
}

export interface RoomRequest {
  name: string;
  capacity: number;
  location?: string;
  floor?: number | null;
  description?: string;
  pricePerHour: number;
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
  cost: number;
  createdAt: string;
  cancelledAt: string | null;
}

export interface BookingRequest {
  roomId: number;
  title: string;
  startTime: string;
  endTime: string;
}

export interface BookingUpdateRequest {
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
