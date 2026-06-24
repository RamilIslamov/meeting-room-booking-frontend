import { useEffect, useState } from 'react';
import { cancelBooking, listMyBookings } from '../api/bookings';
import { errorMessage } from '../api/client';
import { dateOf, timeOf } from '../lib/format';
import type { Booking } from '../types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    listMyBookings()
      .then(setBookings)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onCancel(id: number) {
    setError(null);
    try {
      await cancelBooking(id);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1>My bookings</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {bookings.length === 0 ? (
        <p className="muted">You have no bookings yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Title</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.roomName}</td>
                <td>{dateOf(b.startTime)}</td>
                <td>
                  {timeOf(b.startTime)}–{timeOf(b.endTime)}
                </td>
                <td>{b.title}</td>
                <td>
                  <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                </td>
                <td>
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
      )}
    </div>
  );
}
