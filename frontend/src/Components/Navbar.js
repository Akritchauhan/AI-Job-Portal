import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="nav-links">
        {!token ? (
          // 🔥 Not logged in
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          // 🔥 Logged in
          <>
            <Link to="/jobs">Jobs</Link>
            <Link to="/my-applications">My Applications</Link>
            <Link to="/recruiter">Recruiter</Link>
          </>
        )}
      </div>

      {token && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}