import { useEffect, useState } from "react";
import axios from "axios";
import "./RecruiterDashboard.css";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // 🔥 Fetch recruiter jobs
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/jobs/my-jobs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setJobs(res.data))
      .catch(() => alert("Failed to load jobs"));
  }, []);

  // 🔥 Fetch applicants
  const getApplicants = async (jobId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/jobs/applicants/${jobId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setApplicants(res.data);
      setSelectedJobId(jobId);
    } catch {
      alert("Failed to load applicants");
    }
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="recruiter-container">
      <div className="recruiter-header">
        <h2>Recruiter Dashboard</h2>
        <p>Manage job postings and review applicants</p>
      </div>

      <div className="recruiter-section">
        <h3>📋 Your Job Postings</h3>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>No job postings yet. Create one to start receiving applications!</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <p className="job-role">{job.role}</p>
                <p className="company-name">🏢 {job.company_name}</p>

                <button
                  className="view-btn"
                  onClick={() => getApplicants(job.id)}
                >
                  👥 View Applicants
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJobId && (
        <div className="recruiter-section">
          <h3>📨 Applications</h3>
          {applicants.length === 0 ? (
            <div className="empty-state">
              <p>No applications for this job yet.</p>
            </div>
          ) : (
            <div className="applicants-list">
              {applicants.map((app) => (
                <div key={app.id} className="applicant-card">
                  <div className="applicant-info">
                    <p className="applicant-name">👤 {app.student}</p>
                    <p className="applicant-detail">
                      <strong>Match Score:</strong>{" "}
                      <span className="match-score">{app.match_score}%</span>
                    </p>
                  </div>
                  <span className={`applicant-status ${getStatusClass(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}