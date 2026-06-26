import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { credits } from '../lib/format';

export default function Navbar() {
  const { user, balance, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/rooms" className="navbar-brand">
        Meeting Rooms
      </Link>
      <div className="navbar-links">
        {isAdmin && <NavLink to="/admin/dashboard">Dashboard</NavLink>}
        {isAdmin && <NavLink to="/admin/users">Users</NavLink>}
        <NavLink to="/bookings">Bookings</NavLink>
        <NavLink to="/rooms">Rooms</NavLink>
      </div>
      <div className="navbar-user">
        {balance !== null && <span className="navbar-balance">{credits(balance)}</span>}
        <span className="navbar-email">{user?.email}</span>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
