import { useEffect, useState } from "react";
import axios from "axios";
import "./MyApplications.css";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/jobs/my-applications/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setApplications(res.data);
      })
      .catch(() => {
        alert("Failed to load applications");
      });
  }, []);

  return (
    <div className="app-container">
  <h2>My Applications</h2>

  {applications.map((app) => (
    <div key={app.id} className="app-card">
      <p><strong>Job ID:</strong> {app.job}</p>
      <p><strong>Match Score:</strong> {app.match_score}</p>

      <p className={`app-status status-${app.status}`}>
        Status: {app.status}
      </p>
    </div>
  ))}
</div>
  );
}