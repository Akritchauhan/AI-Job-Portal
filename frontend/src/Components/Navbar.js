import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // Don't show navbar on login/register pages
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/jobs" className="navbar-brand">
        💼 AI Job Portal
      </Link>

      <div className="nav-links">
        {!token ? (
          // 🔥 Not logged in
          <>
            <Link to="/" className={isActive("/") ? "active" : ""}>
              Login
            </Link>
            <Link to="/register" className={isActive("/register") ? "active" : ""}>
              Register
            </Link>
          </>
        ) : (
          // 🔥 Logged in
          <>
            <Link to="/jobs" className={isActive("/jobs") ? "active" : ""}>
              Browse Jobs
            </Link>
            <Link to="/my-applications" className={isActive("/my-applications") ? "active" : ""}>
              My Applications
            </Link>
            <Link to="/recruiter-dashboard" className={isActive("/recruiter-dashboard") ? "active" : ""}>
              Recruiter
            </Link>
          </>
        )}
      </div>

      {token && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  );
}