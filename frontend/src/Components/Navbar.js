import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
    <div className="nav-links">
      <Link to="/jobs">Jobs</Link>
      <Link to="/my-applications">My Applications</Link>
      <Link to="/recruiter">Recruiter</Link>
    </div>
  
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  </div>
  );
}