import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { getRoom } from '../api/rooms';
import { createBooking, listRoomBookings } from '../api/bookings';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { credits, hoursBetween, nowTime, timeOf, toLocalDateTime, todayLocalDate } from '../lib/format';
import type { Booking, Room } from '../types';

interface BookingFormValues {
  title: string;
  startTime: string;
  endTime: string;
}

export default function RoomDetailPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const { isAdmin, balance, refreshBalance } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [date, setDate] = useState(todayLocalDate());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState } = useForm<BookingFormValues>({
    defaultValues: { title: '', startTime: '10:00', endTime: '11:00' },
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const cost = room ? room.pricePerHour * hoursBetween(startTime, endTime) : 0;
  const isToday = date === todayLocalDate();
  // Non-admins cannot pick past dates/times; admins may backdate.
  const minDate = isAdmin ? undefined : todayLocalDate();
  const minTime = !isAdmin && isToday ? nowTime() : undefined;
  const cannotAfford = !isAdmin && balance !== null && cost > balance;

  useEffect(() => {
    getRoom(roomId)
      .then(setRoom)
      .catch((e) => setLoadError(errorMessage(e)));
  }, [roomId]);

  const loadBookings = useCallback(() => {
    listRoomBookings(roomId, date)
      .then(setBookings)
      .catch((e) => setLoadError(errorMessage(e)));
  }, [roomId, date]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function onSubmit(values: BookingFormValues) {
    setFormError(null);
    setSuccess(null);
    try {
      await createBooking({
        roomId,
        title: values.title,
        startTime: toLocalDateTime(date, values.startTime),
        endTime: toLocalDateTime(date, values.endTime),
      });
      setSuccess('Booked!');
      reset({ title: '', startTime: values.startTime, endTime: values.endTime });
      loadBookings();
      void refreshBalance();
    } catch (e) {
      setFormError(errorMessage(e));
    }
  }

  if (loadError) return <div className="alert alert-error">{loadError}</div>;
  if (!room) return <p className="muted">Loading…</p>;

  return (
    <div>
      <p>
        <Link to="/rooms">← Rooms</Link>
      </p>
      <h1>{room.name}</h1>
      <p className="muted">
        Capacity: {room.capacity}
        {room.location ? ` · ${room.location}` : ''} · {credits(room.pricePerHour)}/hour
      </p>
      {room.description && <p>{room.description}</p>}

      <div className="row">
        <label>
          Date
          <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="two-col">
        <section>
          <h2>Bookings on {date}</h2>
          {bookings.length === 0 ? (
            <p className="muted">No bookings for this day.</p>
          ) : (
            <ul className="list">
              {bookings.map((b) => (
                <li key={b.id} className="list-item">
                  <span className="time">
                    {timeOf(b.startTime)}–{timeOf(b.endTime)}
                  </span>
                  <span>{b.title}</span>
                  <span className="muted">{b.userEmail}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>New booking</h2>
          <form className="card" onSubmit={handleSubmit(onSubmit)}>
            {formError && <div className="alert alert-error">{formError}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <label>
              Title
              <input type="text" {...register('title', { required: 'Title is required' })} />
              {formState.errors.title && <span className="field-error">{formState.errors.title.message}</span>}
            </label>
            <div className="row">
              <label>
                Start
                <input type="time" min={minTime} {...register('startTime', { required: true })} />
              </label>
              <label>
                End
                <input type="time" min={minTime} {...register('endTime', { required: true })} />
              </label>
            </div>
            <p className="cost-preview">
              Cost: <strong>{credits(cost)}</strong>
              {isAdmin && <span className="muted"> (admins book for free)</span>}
            </p>
            {cannotAfford && <div className="alert alert-error">Not enough balance for this slot.</div>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formState.isSubmitting || !room.active || cannotAfford}
            >
              {room.active ? 'Book' : 'Room inactive'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
