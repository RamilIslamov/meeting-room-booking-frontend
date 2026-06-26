import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRoom, deleteRoom, listRooms, updateRoom } from '../api/rooms';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { credits } from '../lib/format';
import type { Room } from '../types';

type FloorFilter = 'all' | 'none' | number;

interface FormValues {
  name: string;
  capacity: string;
  floor: string;
  location: string;
  description: string;
  pricePerHour: string;
}

const EMPTY: FormValues = { name: '', capacity: '1', floor: '', location: '', description: '', pricePerHour: '0' };

function toForm(room: Room): FormValues {
  return {
    name: room.name,
    capacity: String(room.capacity),
    floor: room.floor == null ? '' : String(room.floor),
    location: room.location ?? '',
    description: room.description ?? '',
    pricePerHour: String(room.pricePerHour),
  };
}

export default function RoomsPage() {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FloorFilter>('all');

  // One editor open at a time: an existing room id, the create card, or none.
  const [mode, setMode] = useState<{ type: 'edit'; id: number } | { type: 'create' } | null>(null);
  const [form, setForm] = useState<FormValues>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    listRooms()
      .then(setRooms)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const floors = useMemo(
    () => [...new Set(rooms.filter((r) => r.floor != null).map((r) => r.floor as number))].sort((a, b) => a - b),
    [rooms],
  );
  const hasNoFloor = useMemo(() => rooms.some((r) => r.floor == null), [rooms]);

  const visible = rooms.filter((r) =>
    filter === 'all' ? true : filter === 'none' ? r.floor == null : r.floor === filter,
  );

  function startCreate() {
    setFormError(null);
    // Pre-fill the floor with the currently selected one for a quicker add.
    setForm({ ...EMPTY, floor: typeof filter === 'number' ? String(filter) : '' });
    setMode({ type: 'create' });
  }

  function startEdit(room: Room) {
    setFormError(null);
    setForm(toForm(room));
    setMode({ type: 'edit', id: room.id });
  }

  function cancelForm() {
    setMode(null);
    setForm(EMPTY);
    setFormError(null);
  }

  async function submitForm() {
    setFormError(null);
    const body = {
      name: form.name,
      capacity: Number(form.capacity),
      floor: form.floor.trim() === '' ? null : Number(form.floor),
      location: form.location.trim() || undefined,
      description: form.description.trim() || undefined,
      pricePerHour: Number(form.pricePerHour),
    };
    try {
      if (mode?.type === 'edit') {
        await updateRoom(mode.id, body);
      } else {
        await createRoom(body);
      }
      cancelForm();
      load();
    } catch (e) {
      setFormError(errorMessage(e));
    }
  }

  async function onDelete(room: Room) {
    if (!window.confirm(`Delete room "${room.name}"?`)) return;
    setError(null);
    try {
      await deleteRoom(room.id);
      if (mode?.type === 'edit' && mode.id === room.id) cancelForm();
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  function renderForm(submitLabel: string) {
    return (
      <form
        className="room-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submitForm();
        }}
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <div className="row">
          <label>
            Capacity
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </label>
          <label>
            Floor
            <input
              type="number"
              value={form.floor}
              placeholder="—"
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
            />
          </label>
        </div>
        <label>
          Location
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </label>
        <label>
          Description
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label>
          Price per hour (credits)
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.pricePerHour}
            onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
            required
          />
        </label>
        <div className="row">
          <button type="submit" className="btn btn-primary">
            {submitLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={cancelForm}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (loading) return <p className="muted">Loading rooms…</p>;

  return (
    <div>
      <h1>Rooms</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="rooms-layout">
        <aside className="floor-nav">
          <button
            type="button"
            className={`floor-nav-item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All rooms
          </button>
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              className={`floor-nav-item ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              <span className="floor-nav-label">FLOOR</span>
              <span className="floor-nav-num">{f}</span>
            </button>
          ))}
          {hasNoFloor && (
            <button
              type="button"
              className={`floor-nav-item ${filter === 'none' ? 'active' : ''}`}
              onClick={() => setFilter('none')}
            >
              No floor
            </button>
          )}
        </aside>

        <div className="rooms-main">
          {visible.length === 0 && !isAdmin ? (
            <p className="muted">No rooms here.</p>
          ) : (
            <div className="grid">
              {visible.map((room) =>
                isAdmin ? (
                  <div key={room.id} className="card room-card">
                    <div className="room-card-head">
                      <h3>{room.name}</h3>
                      <span className="price">{credits(room.pricePerHour)}/h</span>
                    </div>
                    <p className="muted">
                      Capacity: {room.capacity}
                      {room.location ? ` · ${room.location}` : ''}
                    </p>
                    {room.description && <p>{room.description}</p>}
                    <div className="room-card-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => startEdit(room)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => onDelete(room)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link key={room.id} to={`/rooms/${room.id}`} className="card room-card">
                    <div className="room-card-head">
                      <h3>{room.name}</h3>
                      <span className="price">{credits(room.pricePerHour)}/h</span>
                    </div>
                    <p className="muted">
                      Capacity: {room.capacity}
                      {room.location ? ` · ${room.location}` : ''}
                    </p>
                    {room.description && <p>{room.description}</p>}
                  </Link>
                ),
              )}

              {isAdmin && (
                <button type="button" className="card room-add-card" onClick={startCreate}>
                  <span className="room-add-plus">+</span>
                  <span>Add room</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isAdmin && mode && (
        <div className="modal-overlay" onClick={cancelForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{mode.type === 'edit' ? 'Edit room' : 'Add room'}</h2>
            {renderForm(mode.type === 'edit' ? 'Save' : 'Create')}
          </div>
        </div>
      )}
    </div>
  );
}
