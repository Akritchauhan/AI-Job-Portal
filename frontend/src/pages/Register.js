import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [data, setData] = useState({
    username: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", data);
      alert("Registered successfully");
    } catch (err) {
      if (err.response) {
        alert("Registration failed: " + JSON.stringify(err.response.data));
      } else {
        alert("Server not reachable");
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input name="username" placeholder="Username" onChange={handleChange} />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <select name="role" onChange={handleChange}>
        <option value="student">Student</option>
        <option value="recruiter">Recruiter</option>
      </select>

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}