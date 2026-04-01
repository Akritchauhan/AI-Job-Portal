import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";  
import "./Jobs.css";  

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [file, setFile] = useState(null);

  // 🔥 Fetch jobs
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/jobs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setJobs(res.data);
      })
      .catch(() => {
        alert("Failed to load jobs");
      });
  }, []);

  // 🔥 Apply function
  const handleApply = async (jobId) => {
    if (!file) {
      alert("Please select a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/jobs/apply/${jobId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Applied! Match Score: " + res.data.match_score);
      setFile(null);
    } catch (err) {
      if (err.response) {
        alert("Error: " + JSON.stringify(err.response.data));
      } else {
        alert("Application failed");
      }
    }
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>Job Opportunities</h2>
        <p>Browse and apply to exciting job openings</p>
      </div>

      <div className="jobs-actions">
        <div></div>
        <Link to="/my-applications" className="view-applications-link">
          📋 View My Applications
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <p>No jobs available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3 className="job-role">{job.role}</h3>
                <p className="job-company">🏢 {job.company_name}</p>
              </div>

              <div className="job-description">
                {job.description}
              </div>

              <div className="job-apply-section">
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                    title="Upload your resume (PDF, DOC, DOCX)"
                  />
                  <button
                    className="apply-btn"
                    onClick={() => handleApply(job.id)}
                    disabled={!file}
                  >
                    ✓ Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}