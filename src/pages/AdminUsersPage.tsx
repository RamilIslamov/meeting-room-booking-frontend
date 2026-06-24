import { useEffect, useState } from 'react';
import { listUsers, topUp } from '../api/users';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { credits } from '../lib/format';
import type { UserSummary } from '../types';

export default function AdminUsersPage() {
  const { refreshBalance } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    listUsers()
      .then(setUsers)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onTopUp(userId: number) {
    const amount = Number(amounts[userId]);
    if (!amount || amount <= 0) {
      setError('Enter a positive amount to top up.');
      return;
    }
    setError(null);
    try {
      await topUp(userId, amount);
      setAmounts({ ...amounts, [userId]: '' });
      load();
      void refreshBalance(); // in case the admin topped up their own account
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1>Users</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Balance</th>
            <th>Top up</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.fullName}</td>
              <td>
                <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
              </td>
              <td>{credits(u.balance)}</td>
              <td className="actions">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="amount"
                  className="topup-input"
                  value={amounts[u.id] ?? ''}
                  onChange={(e) => setAmounts({ ...amounts, [u.id]: e.target.value })}
                />
                <button type="button" className="btn btn-secondary" onClick={() => onTopUp(u.id)}>
                  Top up
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
