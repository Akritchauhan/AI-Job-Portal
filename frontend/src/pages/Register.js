import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import "./Register.css";

export default function Register() {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { success, error } = useNotification();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/register/`, data);
      success("Registered successfully! Please log in.");
      navigate("/");
    } catch (err) {
      if (err.response) {
        error("Registration failed: " + JSON.stringify(err.response.data));
      } else {
        error("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <p className="subtitle">Join our platform today</p>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          placeholder="Choose a username"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          name="first_name"
          placeholder="Enter your first name"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          name="last_name"
          placeholder="Enter your last name"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">Register As:</label>
        <select
          id="role"
          name="role"
          value={data.role}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="student">Student / Job Seeker</option>
          <option value="recruiter">Recruiter / Employer</option>
        </select>
      </div>

      <button className="auth-btn" onClick={handleRegister} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Registering...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <p className="link-text">
        Already have an account? <Link to="/">Sign in here</Link>
      </p>
    </div>
  );
}