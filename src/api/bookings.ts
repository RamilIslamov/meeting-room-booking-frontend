import { api } from './client';
import type { Booking, BookingRequest } from '../types';

export function listMyBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/my').then((r) => r.data);
}

export function listRoomBookings(roomId: number, date: string): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings', { params: { roomId, date } }).then((r) => r.data);
}

export function createBooking(body: BookingRequest): Promise<Booking> {
  return api.post<Booking>('/bookings', body).then((r) => r.data);
}

export function cancelBooking(id: number): Promise<void> {
  return api.delete(`/bookings/${id}`).then(() => undefined);
}
