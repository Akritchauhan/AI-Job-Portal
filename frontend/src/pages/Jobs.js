import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";  
import "./Jobs.css";  

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const navigate = useNavigate();
  const { error, success } = useNotification();

  // 🔥 Role validation
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "student") {
      error("Unauthorized! Only students can access this page.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  }, [navigate]);

  // 🔥 Fetch jobs
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/jobs/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setJobs(res.data);
      })
      .catch(() => {
        error("Failed to load jobs");
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

  // 🔥 Group jobs by company
  const getJobsByCompany = () => {
    const grouped = {};
    getSortedJobs().forEach(job => {
      if (!grouped[job.company_name]) {
        grouped[job.company_name] = [];
      }
      grouped[job.company_name].push(job);
    });
    return grouped;
  };

  // 🔥 Apply function
  const handleApply = async (jobId) => {
    if (!file) {
      error("Please select a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/jobs/apply/${jobId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      success("Applied! Match Score: " + res.data.match_score);
      setFile(null);
      setSelectedJobForApply(null);
    } catch (err) {
      if (err.response) {
        error("Error: " + JSON.stringify(err.response.data));
      } else {
        error("Application failed");
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
      ) : selectedJobDetail ? (
        <div className="jobs-list">
          <div className="job-detail-card">
            <button 
              className="back-btn"
              onClick={() => setSelectedJobDetail(null)}
            >
              ← Back to Companies
            </button>

            <div className="job-detail-header">
              <h2 className="job-detail-title">{selectedJobDetail.role}</h2>
              <p className="job-detail-company">🏢 {selectedJobDetail.company_name}</p>
              <div className="job-detail-id">Job ID: #{selectedJobDetail.id}</div>
            </div>

            {selectedJobDetail.description && (
              <div className="job-detail-section">
                <h3 className="job-detail-section-title">📝 Description</h3>
                <p className="job-detail-description">{selectedJobDetail.description}</p>
              </div>
            )}

            {selectedJobDetail.skills_required && (
              <div className="job-detail-section">
                <h3 className="job-detail-section-title">⚡ Required Skills</h3>
                <div className="skills-list">
                  {selectedJobDetail.skills_required.split(',').map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedJobDetail.deadline && (
              <div className="job-detail-section">
                <p><strong>📅 Application Deadline:</strong> {new Date(selectedJobDetail.deadline).toLocaleDateString()}</p>
              </div>
            )}

            {selectedJobDetail.match_score !== null && selectedJobDetail.match_score !== undefined && (
              <div className="job-detail-section">
                <p><strong>🎯 Your Match Score:</strong> <span className="job-item-match">{selectedJobDetail.match_score}%</span></p>
              </div>
            )}

            <div className="job-apply-section">
              {selectedJobForApply === selectedJobDetail.id ? (
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                    title="Upload your resume (PDF, DOC, DOCX)"
                  />
                  <button
                    className="apply-btn"
                    onClick={() => handleApply(selectedJobDetail.id)}
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
                  onClick={() => setSelectedJobForApply(selectedJobDetail.id)}
                >
                  Apply To This Job
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="companies-list">
          {Object.entries(getJobsByCompany()).map(([company, companyJobs]) => (
            <div key={company} className="company-group">
              <button 
                className={`company-header ${expandedCompany === company ? 'expanded' : ''}`}
                onClick={() => setExpandedCompany(expandedCompany === company ? null : company)}
              >
                <span className="company-name-header">🏢 {company}</span>
                <div className="company-header-right">
                  <span className="job-count-badge">{companyJobs.length}</span>
                  <span className="expand-icon">{expandedCompany === company ? '▼' : '▶'}</span>
                </div>
              </button>

              <div className={`jobs-in-company ${expandedCompany !== company ? 'collapsed' : ''}`}>
                {companyJobs.map(job => (
                  <div key={job.id} className="job-item">
                    <div className="job-item-content">
                      <div className="job-item-title">{job.role}</div>
                      <div className="job-item-meta">
                        {job.deadline && (
                          <span className="job-item-meta-item">📅 {new Date(job.deadline).toLocaleDateString()}</span>
                        )}
                        {job.match_score !== null && job.match_score !== undefined && (
                          <span className="job-item-meta-item">
                            Match Score: <span className="job-item-match">{job.match_score}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={() => setSelectedJobDetail(job)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}