import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { getRoom } from '../api/rooms';
import { createBooking, listRoomBookings } from '../api/bookings';
import { errorMessage } from '../api/client';
import { timeOf, toLocalDateTime, todayLocalDate } from '../lib/format';
import type { Booking, Room } from '../types';

interface BookingFormValues {
  title: string;
  startTime: string;
  endTime: string;
}

export default function RoomDetailPage() {
  const { id } = useParams();
  const roomId = Number(id);

  const [room, setRoom] = useState<Room | null>(null);
  const [date, setDate] = useState(todayLocalDate());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<BookingFormValues>({
    defaultValues: { title: '', startTime: '10:00', endTime: '11:00' },
  });

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
        {room.location ? ` · ${room.location}` : ''}
      </p>
      {room.description && <p>{room.description}</p>}

      <div className="row">
        <label>
          Date
          <input type="date" value={date} min={todayLocalDate()} onChange={(e) => setDate(e.target.value)} />
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
                <input type="time" {...register('startTime', { required: true })} />
              </label>
              <label>
                End
                <input type="time" {...register('endTime', { required: true })} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={formState.isSubmitting || !room.active}>
              {room.active ? 'Book' : 'Room inactive'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
