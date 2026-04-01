import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [data, setData] = useState({
    username: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!data.username || !data.password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: data.username,
        password: data.password,
      });
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", data.role);
      alert("Login successful");
      
      // Redirect based on role
      if (data.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/jobs");
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.detail || "Invalid credentials"));
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <p className="subtitle">Sign in to your account</p>
      
      <div className="form-group">
        <label htmlFor="role">Login As</label>
        <select 
          id="role"
          name="role"
          value={data.role}
          onChange={handleChange}
        >
          <option value="student">Student / Job Seeker</option>
          <option value="recruiter">Recruiter / Employer</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input 
          id="username"
          name="username" 
          placeholder="Enter your username" 
          onChange={handleChange}
          value={data.username}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input 
          id="password"
          name="password" 
          type="password" 
          placeholder="Enter your password" 
          onChange={handleChange}
          value={data.password}
        />
      </div>
    
      <button className="auth-btn" onClick={handleLogin}>
        Sign In
      </button>

      <p className="link-text">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}