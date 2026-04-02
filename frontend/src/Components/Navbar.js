import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
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

  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="navbar">
      {/* LEFT - LOGO */}
      <div className="nav-left">
        <Link to="/jobs" className="navbar-brand">
          AI Job Portal
        </Link>
      </div>

      {/* CENTER - LINKS */}
      <div className="nav-center">
        {!token ? (
          <>
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>Login</Link>
            <Link to="/register" className={`nav-link ${isActive("/register") ? "active" : ""}`}>Register</Link>
          </>
        ) : role === "student" ? (
          <>
            <Link to="/jobs" className={`nav-link ${isActive("/jobs") ? "active" : ""}`}>Browse Jobs</Link>
            <Link to="/my-applications" className={`nav-link ${isActive("/my-applications") ? "active" : ""}`}>My Applications</Link>
          </>
        ) : (
          <>
            <Link to="/recruiter-dashboard" className={`nav-link ${isActive("/recruiter-dashboard") ? "active" : ""}`}>
              Dashboard
            </Link>
            <Link to="/view-applicants" className={`nav-link ${isActive("/view-applicants") ? "active" : ""}`}>
              View Applicants
            </Link>
          </>
        )}
      </div>

      {/* RIGHT - LOGOUT */}
      <div className="nav-right">
        {token && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}