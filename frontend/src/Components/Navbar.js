import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
        AI Job Portal
      </Link>

      <div className="nav-links">
        {!token ? (
          <>
            <Link to="/" className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}>
              Login
            </Link>
            <Link to="/register" className={`nav-link ${isActive("/register") ? "nav-link-active" : ""}`}>
              Register
            </Link>
          </>
        ) : role === "student" ? (
          <>
            <Link to="/jobs" className={`nav-link ${isActive("/jobs") ? "nav-link-active" : ""}`}>
              Browse Jobs
            </Link>
            <Link to="/my-applications" className={`nav-link ${isActive("/my-applications") ? "nav-link-active" : ""}`}>
              My Applications
            </Link>
            <Link to="/recruiter-dashboard" className={`nav-link ${isActive("/recruiter-dashboard") ? "nav-link-active" : ""}`}>
              Post Job
            </Link>
          </>
        ) : (
          <>
            <Link to="/recruiter-dashboard" className={`nav-link ${isActive("/recruiter-dashboard") ? "nav-link-active" : ""}`}>
              Dashboard
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