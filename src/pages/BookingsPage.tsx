import { useEffect, useState } from 'react';
import { cancelBooking, listAllBookings, listMyBookings, updateBooking } from '../api/bookings';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { credits, dateOf, nowTime, timeOf, toLocalDateTime, todayLocalDate } from '../lib/format';
import type { Booking } from '../types';

interface EditState {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function BookingsPage() {
  const { isAdmin, refreshBalance } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);

  // Admins manage every booking; regular users see only their own.
  function load() {
    (isAdmin ? listAllBookings() : listMyBookings())
      .then(setBookings)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [isAdmin]);

  function startEdit(b: Booking) {
    setError(null);
    setEdit({
      id: b.id,
      title: b.title,
      date: dateOf(b.startTime),
      startTime: timeOf(b.startTime),
      endTime: timeOf(b.endTime),
    });
  }

  async function saveEdit() {
    if (!edit) return;
    setError(null);
    try {
      await updateBooking(edit.id, {
        title: edit.title,
        startTime: toLocalDateTime(edit.date, edit.startTime),
        endTime: toLocalDateTime(edit.date, edit.endTime),
      });
      setEdit(null);
      load();
      void refreshBalance();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function onCancel(id: number) {
    setError(null);
    try {
      await cancelBooking(id);
      load();
      void refreshBalance();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  function isFuture(b: Booking): boolean {
    return new Date(b.startTime).getTime() > Date.now();
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1>Bookings</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {edit && (
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            void saveEdit();
          }}
        >
          <h2>Edit booking #{edit.id}</h2>
          <label>
            Title
            <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} required />
          </label>
          <div className="row">
            <label>
              Date
              <input
                type="date"
                value={edit.date}
                min={isAdmin ? undefined : todayLocalDate()}
                onChange={(e) => setEdit({ ...edit, date: e.target.value })}
              />
            </label>
            <label>
              Start
              <input
                type="time"
                value={edit.startTime}
                min={!isAdmin && edit.date === todayLocalDate() ? nowTime() : undefined}
                onChange={(e) => setEdit({ ...edit, startTime: e.target.value })}
              />
            </label>
            <label>
              End
              <input
                type="time"
                value={edit.endTime}
                min={!isAdmin && edit.date === todayLocalDate() ? nowTime() : undefined}
                onChange={(e) => setEdit({ ...edit, endTime: e.target.value })}
              />
            </label>
          </div>
          <div className="row">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {bookings.length === 0 ? (
        <p className="muted">{isAdmin ? 'No bookings yet.' : 'You have no bookings yet.'}</p>
      ) : (
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th className="col-room">Room</th>
              <th>Date</th>
              <th>Time</th>
              {isAdmin && <th>User</th>}
              <th>Title</th>
              <th className="num">Cost</th>
              <th className="col-status">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="col-room">{b.roomName}</td>
                <td>{dateOf(b.startTime)}</td>
                <td className="col-time">
                  {timeOf(b.startTime)}–{timeOf(b.endTime)}
                </td>
                {isAdmin && <td className="col-title">{b.userEmail}</td>}
                <td className="col-title">{b.title}</td>
                <td className="num">{credits(b.cost)}</td>
                <td className="col-status">
                  <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                </td>
                <td className="actions">
                  {b.status === 'ACTIVE' && (isAdmin || isFuture(b)) && (
                    <button type="button" className="btn btn-secondary" onClick={() => startEdit(b)}>
                      Edit
                    </button>
                  )}
                  {b.status === 'ACTIVE' && (
                    <button type="button" className="btn btn-danger" onClick={() => onCancel(b.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
