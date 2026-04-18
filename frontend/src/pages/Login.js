import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import "./Login.css";

export default function Login() {
  const [data, setData] = useState({
    username: "",
    password: "",
    selectedRole: "student", // Add role selection
  });
  const [loading, setLoading] = useState(false);
  const { error, success } = useNotification();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!data.username || !data.password) {
      error("Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login/`, {
        username: data.username,
        password: data.password,
      });

      // Get actual role from backend response
      const actualRole = res.data.role;
      const selectedRole = data.selectedRole;
      
      // Validate that selected role matches actual user role
      if (actualRole !== selectedRole) {
        error(`Error: You selected "${selectedRole}" but your account is registered as "${actualRole}". Please login as ${actualRole}.`);
        setLoading(false);
        return;
      }
      
      // Store token and role from backend (validated against selection)
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", actualRole);
      localStorage.setItem("username", res.data.username);
      
      success(res.data.message || "Login successful");
      
      // Redirect based on ACTUAL role from backend
      if (actualRole === "recruiter") {
        navigate("/recruiter-dashboard");
      } else if (actualRole === "student") {
        navigate("/jobs");
      } else {
        error("Invalid user role");
        navigate("/login");
      }
    } catch (err) {
      error("Login failed: " + (err.response?.data?.detail || "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <p className="subtitle">Sign in to your account</p>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input 
          id="username"
          name="username" 
          placeholder="Enter your username" 
          onChange={handleChange}
          value={data.username}
          disabled={loading}
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
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="selectedRole">Login As</label>
        <select 
          id="selectedRole"
          name="selectedRole" 
          onChange={handleChange}
          value={data.selectedRole}
          disabled={loading}
        >
          <option value="student">Student / Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>
      </div>
    
      <button className="auth-btn" onClick={handleLogin} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <p className="link-text">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}