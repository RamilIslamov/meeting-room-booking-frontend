import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRooms } from '../api/rooms';
import { errorMessage } from '../api/client';
import type { Room } from '../types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRooms()
      .then(setRooms)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading rooms…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h1>Rooms</h1>
      {rooms.length === 0 ? (
        <p className="muted">No rooms yet.</p>
      ) : (
        <div className="grid">
          {rooms.map((room) => (
            <Link key={room.id} to={`/rooms/${room.id}`} className="card room-card">
              <h3>{room.name}</h3>
              <p className="muted">Capacity: {room.capacity}</p>
              {room.location && <p className="muted">{room.location}</p>}
              {room.description && <p>{room.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
