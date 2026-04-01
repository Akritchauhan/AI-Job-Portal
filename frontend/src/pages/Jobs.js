import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";  
import "./Jobs.css";  

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

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

  // 🔥 Sort jobs
  const getSortedJobs = () => {
    let sorted = [...jobs];
    
    switch(sortBy) {
      case "match-high":
        sorted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        break;
      case "match-low":
        sorted.sort((a, b) => (a.match_score || 0) - (b.match_score || 0));
        break;
      case "recent":
        sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      default:
        break;
    }
    return sorted;
  };

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
      setSelectedJobForApply(null);
    } catch (err) {
      if (err.response) {
        alert("Error: " + JSON.stringify(err.response.data));
      } else {
        alert("Application failed");
      }
    }
  };

  const sortedJobs = getSortedJobs();

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>Job Opportunities</h2>
        <p>Browse and apply to exciting job openings</p>
      </div>

      <div className="jobs-actions">
        <div className="sort-container">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="match-high">Best Match (High to Low)</option>
            <option value="match-low">Best Match (Low to High)</option>
          </select>
        </div>
        <Link to="/my-applications" className="view-applications-link">
          📋 View My Applications
        </Link>
      </div>

      {sortedJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <p>No jobs available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {sortedJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3 className="job-role">{job.role}</h3>
                <p className="job-company">🏢 {job.company_name}</p>
                {job.match_score !== null && job.match_score !== undefined && (
                  <div className="match-score-badge">
                    Match: {job.match_score}%
                  </div>
                )}
              </div>

              <div className="job-description">
                {job.description}
              </div>

              <div className="job-apply-section">
                {selectedJobForApply === job.id ? (
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
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setSelectedJobForApply(null);
                        setFile(null);
                      }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="apply-btn primary"
                    onClick={() => setSelectedJobForApply(job.id)}
                  >
                    Apply To This Job
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}