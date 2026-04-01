import { useEffect, useState } from "react";
import axios from "axios";
import "./MyApplications.css";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

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

  const filteredApplications = 
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status.toLowerCase() === filterStatus);

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const uniqueStatuses = ["all", ...new Set(applications.map(app => app.status.toLowerCase()))];

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>My Applications</h2>
        <p>Track the status of your job applications</p>
      </div>

      {applications.length > 0 && (
        <div className="filters">
          {uniqueStatuses.map((status) => (
            <button
              key={status}
              className={`filter-badge ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === "all" ? "All Applications" : getStatusLabel(status)}{" "}
              ({status === "all" 
                ? applications.length 
                : applications.filter((a) => a.status.toLowerCase() === status).length})
            </button>
          ))}
        </div>
      )}

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">
            {applications.length === 0 
              ? "You haven't applied to any jobs yet" 
              : `No applications with status "${getStatusLabel(filterStatus)}"`}
          </p>
          <p className="empty-state-subtext">
            {applications.length === 0 
              ? "Explore job opportunities and submit your applications!" 
              : "Try a different filter"}
          </p>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApplications.map((app) => (
            <div key={app.id} className="app-card">
              <div className="app-details">
                <h3 className="app-job-title">Job #{app.job}</h3>
                <p className="app-company">Position at Company</p>
                <div className="app-meta">
                  <div className="app-meta-item">
                    <span className="app-meta-label">Match Score</span>
                    <span className="app-meta-value app-match-score">
                      {app.match_score || "N/A"}%
                    </span>
                  </div>
                  <div className="app-meta-item">
                    <span className="app-meta-label">Application Date</span>
                    <span className="app-meta-value">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="app-status-container">
                <span className={`app-status ${getStatusClass(app.status)}`}>
                  {getStatusLabel(app.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}