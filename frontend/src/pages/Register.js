import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [data, setData] = useState({
    username: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", data);
      alert("Registered successfully! Please log in.");
      navigate("/");
    } catch (err) {
      if (err.response) {
        alert("Registration failed: " + JSON.stringify(err.response.data));
      } else {
        alert("Server not reachable");
      }
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
        <label htmlFor="role">Account Type</label>
        <select id="role" name="role" onChange={handleChange}>
          <option value="student">Student / Job Seeker</option>
          <option value="recruiter">Recruiter / Employer</option>
        </select>
      </div>

      <button className="auth-btn" onClick={handleRegister}>
        Create Account
      </button>

      <p className="link-text">
        Already have an account? <Link to="/">Sign in here</Link>
      </p>
    </div>
  );
}