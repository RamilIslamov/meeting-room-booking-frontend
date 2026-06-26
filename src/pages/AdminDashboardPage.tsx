import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { listBookingsInRange } from '../api/bookings';
import { errorMessage } from '../api/client';
import { addDays, credits, dateOf, isoDate, startOfWeek, timeOf, weekLabel } from '../lib/format';
import type { Booking } from '../types';

type WeekKey = 'prev' | 'current' | 'next';

interface WeekBucket {
  key: WeekKey;
  label: string;
  title: string;
  monday: Date;
  bookings: Booking[];
  earned: number;
  active: number;
  cancelled: number;
}

const STATUS_COLORS = { active: '#16a34a', cancelled: '#94a3b8' };

function sumEarned(bookings: Booking[]): number {
  return bookings
    .filter((b) => b.status === 'ACTIVE')
    .reduce((acc, b) => acc + Number(b.cost), 0);
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Three-week window centred on the focused week; arrows shift it by `weekOffset`.
  const [weekOffset, setWeekOffset] = useState(0);
  const window = useMemo(() => {
    const currentMonday = addDays(startOfWeek(new Date()), weekOffset * 7);
    const prevMonday = addDays(currentMonday, -7);
    const nextMonday = addDays(currentMonday, 7);
    const lastDay = addDays(nextMonday, 6); // Sunday of next week
    return { prevMonday, currentMonday, nextMonday, from: isoDate(prevMonday), to: isoDate(lastDay) };
  }, [weekOffset]);

  useEffect(() => {
    listBookingsInRange(window.from, window.to)
      .then(setBookings)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [window.from, window.to]);

  const weeks: WeekBucket[] = useMemo(() => {
    const defs: { key: WeekKey; title: string; monday: Date }[] = [
      { key: 'prev', title: 'Previous week', monday: window.prevMonday },
      { key: 'current', title: 'This week', monday: window.currentMonday },
      { key: 'next', title: 'Next week', monday: window.nextMonday },
    ];
    return defs.map((d) => {
      const start = isoDate(d.monday);
      const end = isoDate(addDays(d.monday, 7)); // exclusive next Monday
      const inWeek = bookings.filter((b) => {
        const day = dateOf(b.startTime);
        return day >= start && day < end;
      });
      return {
        ...d,
        label: weekLabel(d.monday),
        bookings: inWeek,
        earned: sumEarned(inWeek),
        active: inWeek.filter((b) => b.status === 'ACTIVE').length,
        cancelled: inWeek.filter((b) => b.status === 'CANCELLED').length,
      };
    });
  }, [bookings, window]);

  const current = weeks.find((w) => w.key === 'current')!;
  const totalEarned = weeks.reduce((acc, w) => acc + w.earned, 0);
  const totalActive = weeks.reduce((acc, w) => acc + w.active, 0);
  const totalCancelled = weeks.reduce((acc, w) => acc + w.cancelled, 0);

  const barData = weeks.map((w) => ({ name: w.title.replace(' week', ''), earned: Number(w.earned.toFixed(2)) }));
  const pieData = [
    { name: 'Active', value: totalActive, fill: STATUS_COLORS.active },
    { name: 'Cancelled', value: totalCancelled, fill: STATUS_COLORS.cancelled },
  ].filter((d) => d.value > 0);

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="dash-head">
        <div>
          <h1>Admin dashboard</h1>
          <span className="muted">
            {window.prevMonday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} —{' '}
            {addDays(window.nextMonday, 6).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="week-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setWeekOffset((o) => o - 1)}
            aria-label="Previous week"
          >
            ←
          </button>
          <span className="week-nav-label">{weekLabel(window.currentMonday)}</span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setWeekOffset((o) => o + 1)}
            aria-label="Next week"
          >
            →
          </button>
          {weekOffset !== 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => setWeekOffset(0)}>
              Today
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="kpi-grid">
        <div className="kpi kpi-accent">
          <span className="kpi-label">Earned · selected week</span>
          <span className="kpi-value">{credits(current.earned)}</span>
          <span className="kpi-sub">{credits(totalEarned)} across 3 weeks</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Active · selected week</span>
          <span className="kpi-value">{current.active}</span>
          <span className="kpi-sub">{totalActive} across 3 weeks</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Cancelled · selected week</span>
          <span className="kpi-value">{current.cancelled}</span>
          <span className="kpi-sub">{totalCancelled} across 3 weeks</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Bookings · selected week</span>
          <span className="kpi-value">{current.bookings.length}</span>
          <span className="kpi-sub">{bookings.length} across 3 weeks</span>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h2>Credits earned by week</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(v: number) => credits(v)} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
              <Bar dataKey="earned" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={64} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Booking status (3 weeks)</h2>
          {pieData.length === 0 ? (
            <p className="muted">No bookings in this window.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={2}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Selected week — {current.label}</h2>
        {current.bookings.length === 0 ? (
          <p className="muted">No bookings this week.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Room</th>
                <th>User</th>
                <th>Title</th>
                <th className="num">Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {current.bookings.map((b) => (
                <tr key={b.id}>
                  <td>{dateOf(b.startTime)}</td>
                  <td className="col-time">
                    {timeOf(b.startTime)}–{timeOf(b.endTime)}
                  </td>
                  <td>{b.roomName}</td>
                  <td className="col-title">{b.userEmail}</td>
                  <td className="col-title">{b.title}</td>
                  <td className="num">{credits(b.cost)}</td>
                  <td>
                    <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
