import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createRoom, deleteRoom, listRooms, updateRoom } from '../api/rooms';
import { errorMessage } from '../api/client';
import { credits } from '../lib/format';
import type { Room } from '../types';

interface RoomFormValues {
  name: string;
  capacity: number;
  location: string;
  description: string;
  pricePerHour: number;
}

const EMPTY: RoomFormValues = { name: '', capacity: 1, location: '', description: '', pricePerHour: 0 };

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<RoomFormValues>({ defaultValues: EMPTY });

  function load() {
    listRooms()
      .then(setRooms)
      .catch((e) => setError(errorMessage(e)));
  }

  useEffect(load, []);

  function startEdit(room: Room) {
    setEditingId(room.id);
    reset({
      name: room.name,
      capacity: room.capacity,
      location: room.location ?? '',
      description: room.description ?? '',
      pricePerHour: room.pricePerHour,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    reset(EMPTY);
  }

  async function onSubmit(values: RoomFormValues) {
    setError(null);
    const body = {
      name: values.name,
      capacity: Number(values.capacity),
      location: values.location || undefined,
      description: values.description || undefined,
      pricePerHour: Number(values.pricePerHour),
    };
    try {
      if (editingId === null) {
        await createRoom(body);
      } else {
        await updateRoom(editingId, body);
      }
      cancelEdit();
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function onDelete(id: number) {
    setError(null);
    try {
      await deleteRoom(id);
      if (editingId === id) cancelEdit();
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <h1>Manage rooms</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <form className="card" onSubmit={handleSubmit(onSubmit)}>
        <h2>{editingId === null ? 'Create room' : `Edit room #${editingId}`}</h2>
        <label>
          Name
          <input type="text" {...register('name', { required: 'Name is required' })} />
          {formState.errors.name && <span className="field-error">{formState.errors.name.message}</span>}
        </label>
        <label>
          Capacity
          <input
            type="number"
            min={1}
            {...register('capacity', { required: true, valueAsNumber: true, min: { value: 1, message: 'Min 1' } })}
          />
          {formState.errors.capacity && <span className="field-error">{formState.errors.capacity.message}</span>}
        </label>
        <label>
          Location
          <input type="text" {...register('location')} />
        </label>
        <label>
          Description
          <textarea rows={2} {...register('description')} />
        </label>
        <label>
          Price per hour (credits)
          <input
            type="number"
            min={0}
            step="0.01"
            {...register('pricePerHour', {
              required: true,
              valueAsNumber: true,
              min: { value: 0, message: 'Must be 0 or more' },
            })}
          />
          {formState.errors.pricePerHour && (
            <span className="field-error">{formState.errors.pricePerHour.message}</span>
          )}
        </label>
        <div className="row">
          <button type="submit" className="btn btn-primary" disabled={formState.isSubmitting}>
            {editingId === null ? 'Create' : 'Save'}
          </button>
          {editingId !== null && (
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>Active rooms</h2>
      {rooms.length === 0 ? (
        <p className="muted">No active rooms.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Price/h</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{room.capacity}</td>
                <td>{room.location ?? '—'}</td>
                <td>{credits(room.pricePerHour)}</td>
                <td className="actions">
                  <button type="button" className="btn btn-secondary" onClick={() => startEdit(room)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(room.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
