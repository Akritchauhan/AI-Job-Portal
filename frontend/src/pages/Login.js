import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate(); // ✅ FIX

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", data);
      localStorage.setItem("token", res.data.access);
      alert("Login successful");
      navigate("/jobs");
    } catch (err) {
      alert("Login failed");
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