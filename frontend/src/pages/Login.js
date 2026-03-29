import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
    <div>
      <h2>Login</h2>
  
      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
      />
  
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
  
      <button onClick={handleLogin}>Login</button>
  
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}