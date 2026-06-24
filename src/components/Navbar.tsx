import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
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
        <NavLink to="/rooms">Rooms</NavLink>
        <NavLink to="/my-bookings">My bookings</NavLink>
        {isAdmin && <NavLink to="/admin/rooms">Admin</NavLink>}
      </div>
      <div className="navbar-user">
        <span className="navbar-email">{user?.email}</span>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
